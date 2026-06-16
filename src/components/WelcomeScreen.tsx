import { ChevronRight } from 'lucide-react'

interface WelcomeScreenProps {
  onGetStarted: () => void
  onSignIn: () => void
}

export default function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-surface-dark">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-safe">
        <div className="w-24 h-24 rounded-3xl gradient-brand flex items-center justify-center mb-6 shadow-lg shadow-brand-500/30">
          <span className="text-4xl">🚗</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center">ClearLane</h1>
        <p className="text-lg text-brand-600 dark:text-brand-400 font-bold mt-1">From Nervous to Confident</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4 leading-relaxed max-w-xs">
          The complete driving confidence and road test preparation platform. Master hazard perception, build real-world skills, and pass your test with confidence.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-xs">
          {[{ value: '94%', label: 'Pass rate' }, { value: '3.2x', label: 'Confidence boost' }, { value: '12k+', label: 'Drivers helped' }].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-extrabold text-brand-600 dark:text-brand-400">{s.value}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 pb-12 space-y-3">
        <button onClick={onGetStarted} className="btn-primary w-full text-base py-4">Get Started <ChevronRight size={20} /></button>
        <button onClick={onSignIn} className="btn-ghost w-full text-sm">I already have an account</button>
      </div>
    </div>
  )
}
