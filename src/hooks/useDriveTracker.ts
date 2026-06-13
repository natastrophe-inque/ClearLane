import { useState, useRef, useCallback, useEffect } from 'react'

export interface GpsPosition {
  lat: number
  lng: number
  speed: number
  heading: number | null
  accuracy: number
  timestamp: number
}

export interface DriveEvent {
  type: 'harsh_brake' | 'rapid_accel' | 'sharp_turn' | 'speed_limit'
  timestamp: number
  severity: 'low' | 'medium' | 'high'
  message: string
  position: GpsPosition
}

export interface DriveSession {
  startTime: number
  endTime: number | null
  positions: GpsPosition[]
  events: DriveEvent[]
  totalDistanceKm: number
  maxSpeedKmh: number
  avgSpeedKmh: number
  brakeEvents: number
  accelerationEvents: number
}

function haversineKm(p1: GpsPosition, p2: GpsPosition): number {
  const R = 6371
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function calcSpeedKmh(p1: GpsPosition, p2: GpsPosition): number {
  const dist = haversineKm(p1, p2)
  const dtHrs = (p2.timestamp - p1.timestamp) / (1000 * 3600)
  if (dtHrs <= 0) return p2.speed > 0 ? p2.speed : 0
  const calc = dist / dtHrs
  return calc > 0 ? calc : p2.speed > 0 ? p2.speed : 0
}

const BRAKE_THRESHOLD_KMH_S = -6.5
const ACCEL_THRESHOLD_KMH_S = 8.0
const MIN_MOVEMENT_KMH = 3
const POSITION_INTERVAL_MIN_MS = 2000

export function useDriveTracker() {
  const [session, setSession] = useState<DriveSession | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [currentDistance, setCurrentDistance] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [lastPosition, setLastPosition] = useState<GpsPosition | null>(null)

  const watchIdRef = useRef<number | null>(null)
  const sessionRef = useRef<DriveSession | null>(null)
  const prevPositionRef = useRef<GpsPosition | null>(null)
  const lastSampleTimeRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cleanup = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsTracking(false)
  }, [])

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }

    const initialSession: DriveSession = {
      startTime: Date.now(),
      endTime: null,
      positions: [],
      events: [],
      totalDistanceKm: 0,
      maxSpeedKmh: 0,
      avgSpeedKmh: 0,
      brakeEvents: 0,
      accelerationEvents: 0,
    }

    sessionRef.current = initialSession
    setSession(initialSession)
    setCurrentSpeed(0)
    setCurrentDistance(0)
    setElapsedSeconds(0)
    setIsTracking(true)
    prevPositionRef.current = null
    lastSampleTimeRef.current = 0

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now()
        if (now - lastSampleTimeRef.current < POSITION_INTERVAL_MIN_MS) return
        lastSampleTimeRef.current = now

        const gpsPos: GpsPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: pos.coords.speed != null ? pos.coords.speed * 3.6 : 0,
          heading: pos.coords.heading ?? null,
          accuracy: pos.coords.accuracy,
          timestamp: now,
        }

        const sess = sessionRef.current
        if (!sess) return

        let speed = gpsPos.speed
        let moveDist = 0
        if (prevPositionRef.current) {
          const prev = prevPositionRef.current
          speed = calcSpeedKmh(prev, gpsPos)
          moveDist = haversineKm(prev, gpsPos)

          const dtSec = (gpsPos.timestamp - prev.timestamp) / 1000
          const accel = dtSec > 0 ? (speed - prev.speed) / dtSec : 0

          if (accel < BRAKE_THRESHOLD_KMH_S) {
            const severity = accel < -12 ? 'high' : accel < -9 ? 'medium' : 'low'
            const event: DriveEvent = {
              type: 'harsh_brake',
              timestamp: now,
              severity,
              message: `Harsh braking detected (${Math.round(Math.abs(accel))} km/h/s deceleration)`,
              position: gpsPos,
            }
            sess.events.push(event)
            sess.brakeEvents++
          } else if (accel > ACCEL_THRESHOLD_KMH_S) {
            const event: DriveEvent = {
              type: 'rapid_accel',
              timestamp: now,
              severity: 'low',
              message: `Rapid acceleration (${Math.round(accel)} km/h/s)`,
              position: gpsPos,
            }
            sess.events.push(event)
            sess.accelerationEvents++
          }
        }

        if (speed > MIN_MOVEMENT_KMH) {
          sess.totalDistanceKm += moveDist
        }

        if (speed > sess.maxSpeedKmh) sess.maxSpeedKmh = Math.round(speed)

        sess.positions.push(gpsPos)
        prevPositionRef.current = gpsPos

        setCurrentSpeed(Math.round(speed))
        setCurrentDistance(Math.round(sess.totalDistanceKm * 100) / 100)
        setLastPosition(gpsPos)
        setSession({ ...sess })
      },
      (err) => {
        console.warn('GPS error:', err.message)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 15000,
      }
    )
  }, [])

  const stopTracking = useCallback((): DriveSession | null => {
    cleanup()
    const sess = sessionRef.current
    if (!sess) return null

    sess.endTime = Date.now()
    sess.maxSpeedKmh = Math.round(sess.maxSpeedKmh)

    const moving = sess.positions.filter((p) => p.speed > MIN_MOVEMENT_KMH)
    if (moving.length > 0) {
      sess.avgSpeedKmh = Math.round(
        moving.reduce((s, p) => s + p.speed, 0) / moving.length
      )
    }

    sessionRef.current = null
    setSession(sess)
    return sess
  }, [cleanup])

  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  return {
    session,
    isTracking,
    currentSpeed,
    currentDistance,
    elapsedSeconds,
    lastPosition,
    startTracking,
    stopTracking,
  }
}
