import { useState, useRef, useCallback, useEffect } from 'react'
import { MapPin, Navigation, Gauge, Timer, Route, OctagonX, AlertTriangle, Zap } from 'lucide-react'
import ScreenHeader from '@/components/ScreenHeader'
import { cn } from '@/lib/utils'
import { useDriveTracker } from '@/hooks/useDriveTracker'
import type { DriveSession } from '@/hooks/useDriveTracker'

interface DriveTrackerProps {
  onStop: (session: DriveSession) => void
  onBack: () => void
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function DriveTracker({ onStop, onBack }: DriveTrackerProps) {
  const { currentSpeed, currentDistance, elapsedSeconds, lastPosition, session, startTracking, stopTracking } = useDriveTracker()
  const [started, setStarted] = useState(false)
  const [stopping, setStopping] = useState(false)
  const [confirmStop, setConfirmStop] = useState(false)

  const events = session?.events ?? []
  const recentEvents = events.slice(-3).reverse()

  const handleStart = () => { setStarted(true); startTracking() }
  const handleStop = () => {
    if (!confirmStop) { setConfirmStop(true); setTimeout(() => setConfirmStop(false), 4000); return }
    setStopping(true)
    const final = stopTracking()
    if (final) setTimeout(() => onStop(final), 400)
  }

  if (!started) {
    return (
      <div className="flex-1 overflow-y-auto pb-24">
        <ScreenHeader title="Real Drive" subtitle="GPS-powered session tracking" onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 mt-8 space-y-6">
          <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Navigation size={40} className="text-green-600 dark:text-green-400" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Ready to track your drive</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">ClearLane will use GPS to track your speed, distance, and driving smoothness in real time.</p>
          </div>
          <div className="w-full card space-y-3">
            <div className="flex items-center gap-2"><MapPin size={16} className="text-green-500" /><span className="text-xs text-gray-600">Real-time GPS tracking</span></div>
            <div className="flex items-center gap-2"><Gauge size={16} className="text-blue-500" /><span className="text-xs text-gray-600">Speed, distance & route logging</span></div>
            <div className="flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /><span className="text-xs text-gray-600">Harsh braking & acceleration detection</span></div>
            <div className="flex items-center gap-2"><Timer size={16} className="text-purple-500" /><span className="text-xs text-gray-600">Post-drive score & analysis</span></div>
          </div>
          <button onClick={handleStart} className="btn-primary w-full max-w-xs text-lg py-4">Start Drive</button>
          <p className="text-xs text-gray-400 text-center">Mount your phone securely before driving</p>
        </div>
      </div>
    )
  }

  if (stopping) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <div className="w-20 h-20 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center animate-pulse">
          <Route size={36} className="text-brand-600 dark:text-brand-400" />
        </div>
        <p className="text-lg font-bold text-gray-900 dark:text-white mt-4">Analyzing your drive...</p>
        <p className="text-sm text-gray-500 mt-1">Building your score and insights</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <ScreenHeader title="Tracking Drive" subtitle="Keep your eyes on the road" />
      <div className="px-4 mt-2 space-y-4">
        <div className="card bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-white border-0 text-center py-6">
          <p className="text-sm text-white/50 font-medium uppercase tracking-widest">Current Speed</p>
          <p className="text-6xl font-extrabold mt-1 tabular-nums">{currentSpeed}</p>
          <p className="text-sm text-white/50 mt-1">km/h</p>
          <div className="flex justify-center gap-6 mt-3">
            <div className="text-center"><p className="text-xs text-white/40">DISTANCE</p><p className="text-lg font-bold tabular-nums">{currentDistance}<span className="text-xs font-normal text-white/50"> km</span></p></div>
            <div className="text-center"><p className="text-xs text-white/40">TIME</p><p className="text-lg font-bold tabular-nums">{formatTime(elapsedSeconds)}</p></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center"><p className="text-xs text-gray-400 font-medium">Avg Speed</p><p className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums mt-0.5">{session ? Math.round(session.avgSpeedKmh || currentSpeed) : currentSpeed}</p></div>
          <div className="card text-center"><p className="text-xs text-gray-400 font-medium">Max Speed</p><p className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums mt-0.5">{session?.maxSpeedKmh ?? currentSpeed}</p></div>
        </div>
        {lastPosition && <div className="flex items-center gap-2 px-1"><MapPin size={14} className={cn(lastPosition.accuracy < 15 ? 'text-green-500' : lastPosition.accuracy < 30 ? 'text-amber-500' : 'text-red-500')} /><span className="text-xs text-gray-400">GPS accuracy: {Math.round(lastPosition.accuracy)}m</span></div>}
        {recentEvents.length > 0 && (
          <div>
            <h3 className="section-title">Events</h3>
            <div className="mt-2 space-y-2">
              {recentEvents.map((ev) => (
                <div key={ev.timestamp} className={cn('card flex items-center gap-3 border-l-4', ev.type === 'harsh_brake' ? 'border-l-red-500' : 'border-l-amber-500')}>
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', ev.severity === 'high' ? 'bg-red-100 dark:bg-red-900/30' : ev.severity === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30')}>
                    {ev.type === 'harsh_brake' ? <OctagonX size={16} className="text-red-600 dark:text-red-400" /> : <Zap size={16} className="text-amber-600 dark:text-amber-400" />}
                  </div>
                  <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-gray-900 dark:text-white">{ev.message}</p><p className="text-[10px] text-gray-400">{new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}
        <button onClick={handleStop} className={cn('w-full py-4 rounded-2xl font-bold text-base transition-all', confirmStop ? 'bg-red-600 text-white animate-pulse' : 'bg-red-500 text-white')}>
          {confirmStop ? 'Tap again to confirm stop' : 'End Drive'}
        </button>
      </div>
    </div>
  )
}
