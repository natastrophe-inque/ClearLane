import { Gauge, BarChart3, Navigation } from 'lucide-react'
import ScreenHeader from '@/components/ScreenHeader'
import { cn, formatDate, scoreBgColor } from '@/lib/utils'
import type { DrivingInsight } from '@/types'

interface DriveScreenProps {
  insights: DrivingInsight[]
  onAnalyze: () => void
  onConfidenceMode: () => void
  onRealDrive: () => void
}

export default function DriveScreen({ insights, onAnalyze, onConfidenceMode, onRealDrive }: DriveScreenProps) {
  const latest = insights[0]
  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <ScreenHeader title="Real Drive" subtitle="Track and improve your driving" icon={Gauge} />
      <div className="px-4 mt-2 space-y-4">
        {latest && (
          <div className="card bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-white/70 font-medium">Latest Drive</p>
              <span className="badge bg-white/20 text-white">{formatDate(latest.date)}</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-extrabold">{latest.scores.overall}</p>
                <p className="text-xs text-white/60">Overall Score</p>
              </div>
              <div className="text-right text-xs text-white/60">
                <p>{latest.durationMinutes} min</p>
                <p>{latest.distanceKm} km</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[
                { label: 'Speed', val: latest.scores.speedConsistency },
                { label: 'Braking', val: latest.scores.braking },
                { label: 'Smooth', val: latest.scores.smoothness },
                { label: 'Hazard', val: latest.scores.hazardAwareness },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="w-full bg-white/20 rounded-full h-1.5 mb-1">
                    <div className={cn('h-full rounded-full', scoreBgColor(s.val))} style={{ width: `${s.val}%` }} />
                  </div>
                  <p className="text-[10px] text-white/60">{s.label}</p>
                  <p className="text-xs font-bold">{s.val}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          <button onClick={onRealDrive} className="card-interactive text-left bg-gradient-to-br from-green-50 to-green-100">
            <Navigation size={20} className="text-green-600 mb-1" />
            <p className="text-sm font-bold">Start Drive</p>
            <p className="text-xs text-gray-500 mt-0.5">GPS tracking</p>
          </button>
          <button onClick={onAnalyze} className="card-interactive text-left">
            <BarChart3 size={20} className="text-brand-600 mb-1" />
            <p className="text-sm font-bold">Analyze</p>
            <p className="text-xs text-gray-500 mt-0.5">Review route</p>
          </button>
          <button onClick={onConfidenceMode} className="card-interactive text-left">
            <span className="text-xl mb-1 block">🧘</span>
            <p className="text-sm font-bold">Calm</p>
            <p className="text-xs text-gray-500 mt-0.5">Breathing tools</p>
          </button>
        </div>
      </div>
    </div>
  )
}