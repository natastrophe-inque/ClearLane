import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { GpsPosition, DriveEvent } from '@/hooks/useDriveTracker'

import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.Icon.Default
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (DefaultIcon.prototype as any)._getIconUrl
DefaultIcon.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

const startIcon = L.divIcon({
  className: 'drive-marker start-marker',
  html: '<div style="width:28px;height:28px;border-radius:50%;background:#22c55e;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><span style="font-size:14px">S</span></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

const endIcon = L.divIcon({
  className: 'drive-marker end-marker',
  html: '<div style="width:28px;height:28px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><span style="font-size:14px;color:white">E</span></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

const brakeIcon = L.divIcon({
  className: 'drive-marker event-marker',
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#ef4444;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const accelIcon = L.divIcon({
  className: 'drive-marker event-marker',
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#f59e0b;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

interface DriveRouteMapProps {
  positions: GpsPosition[]
  events: DriveEvent[]
  className?: string
}

export default function DriveRouteMap({ positions, events, className }: DriveRouteMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current || positions.length < 2) return

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map
    setReady(true)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [positions.length])

  useEffect(() => {
    const map = mapRef.current
    if (!map || positions.length < 2) return

    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
        map.removeLayer(layer)
      }
    })

    const latlngs: [number, number][] = positions.map((p) => [p.lat, p.lng] as [number, number])
    const speeds = positions.map((p) => p.speed)
    const maxSpeed = Math.max(...speeds, 1)

    for (let i = 1; i < latlngs.length; i++) {
      const speedPct = speeds[i] / maxSpeed
      const color = speedPct > 0.7
        ? '#22c55e'
        : speedPct > 0.4
        ? '#3b82f6'
        : speedPct > 0.2
        ? '#f59e0b'
        : '#ef4444'

      L.polyline([latlngs[i - 1], latlngs[i]], {
        color,
        weight: 4,
        opacity: 0.85,
      }).addTo(map)
    }

    L.marker(latlngs[0], { icon: startIcon })
      .addTo(map)
      .bindTooltip('Start', { direction: 'top', offset: [0, -14] })

    L.marker(latlngs[latlngs.length - 1], { icon: endIcon })
      .addTo(map)
      .bindTooltip('End', { direction: 'top', offset: [0, -14] })

    events.forEach((ev) => {
      const icon = ev.type === 'harsh_brake' ? brakeIcon : accelIcon
      L.marker([ev.position.lat, ev.position.lng], { icon })
        .addTo(map)
        .bindTooltip(ev.message, { direction: 'top', offset: [0, -10] })
    })

    const bounds = L.latLngBounds(latlngs)
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 })
  }, [positions, events, ready])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: 220, borderRadius: 16, overflow: 'hidden' }}
    />
  )
}
