import { useState } from 'react'
import { Check, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AuthUser } from '@/hooks/useAuth'

interface OnboardingWizardProps {
  onComplete: (data: Partial<AuthUser>) => void
}

const steps = [
  { title: "What's your name?", subtitle: 'Your coach will use this to personalize your experience.', field: 'name' as const, placeholder: 'Your full name', emoji: '👋' },
  { title: 'Which road test are you preparing for?', subtitle: 'This helps us tailor your practice content.', field: 'testType' as const, options: [{ label: 'Ontario G2', value: 'G2' as const, desc: 'First road test after G1' }, { label: 'Ontario G', value: 'G' as const, desc: 'Full license road test' }, { label: "I'm not sure yet", value: 'none' as const, desc: 'Just building confidence' }], emoji: '🚗' },
  { title: 'When is your test?', subtitle: "Optional — we'll create a study plan counting down to your date.", field: 'testDate' as const, placeholder: 'YYYY-MM-DD (or skip)', emoji: '📅' },
  { title: 'How would you rate your driving anxiety?', subtitle: 'This helps us recommend the right confidence-building exercises.', field: 'anxietyLevel' as const, slider: true, emoji: '😨', labels: ['Very calm', 'Mild nerves', 'Moderate', 'Quite anxious', 'Very anxious'] },
  { title: 'What are your main goals?', subtitle: "Select all that apply — we'll customize your training plan.", field: 'goals' as const, multi: true, options: [{ label: 'Pass my road test', value: 'Pass my road test' }, { label: 'Reduce driving anxiety', value: 'Reduce driving anxiety' }, { label: 'Master highway driving', value: 'Master highway driving' }, { label: 'Improve parking skills', value: 'Improve parking skills' }, { label: 'Build overall confidence', value: 'Build overall confidence' }, { label: 'Learn defensive driving', value: 'Learn defensive driving' }], emoji: '🎯' },
]

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [testType, setTestType] = useState<'G2' | 'G' | 'none'>('none')
  const [testDate, setTestDate] = useState('')
  const [anxietyLevel, setAnxietyLevel] = useState(5)
  const [goals, setGoals] = useState<string[]>([])

  const currentStep = steps[step]

  const goNext = () => {
    if (step < steps.length - 1) setStep(step + 1)
    else onComplete({ name, testType, testDate: testDate || null, anxietyLevel, goals })
  }

  const goBack = () => { if (step > 0) setStep(step - 1) }

  const canAdvance = (): boolean => {
    switch (currentStep.field) {
      case 'name': return name.trim().length >= 2
      case 'testType': return true
      case 'testDate': return true
      case 'anxietyLevel': return true
      case 'goals': return goals.length > 0
    }
  }

  const toggleGoal = (goal: string) => { setGoals((prev) => prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]) }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-surface-dark">
      <div className="px-6 pt-safe pt-8">
        <div className="flex gap-1.5 mb-6">
          {steps.map((_, i) => <div key={i} className={cn('h-1 flex-1 rounded-full transition-all duration-300', i < step ? 'bg-brand-500' : i === step ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700')} />)}
        </div>
        <p className="text-xs text-gray-400 font-medium">Step {step + 1} of {steps.length}</p>
      </div>
      <div className="flex-1 flex flex-col px-6">
        <div className="flex-1">
          <div className="text-center mb-8">
            <span className="text-5xl mb-4 block">{currentStep.emoji}</span>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{currentStep.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{currentStep.subtitle}</p>
          </div>
          {currentStep.field === 'name' && <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={currentStep.placeholder} className="input text-center text-lg font-semibold" autoFocus />}
          {currentStep.field === 'testType' && currentStep.options && (
            <div className="space-y-3">
              {currentStep.options.map((opt) => (
                <button key={opt.value} onClick={() => setTestType(opt.value)} className={cn('w-full text-left p-4 rounded-2xl border-2 transition-all', testType === opt.value ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-200 dark:border-gray-700')}>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{opt.label}</p><p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          )}
          {currentStep.field === 'testDate' && <div><input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} className="input text-center" /><p className="text-xs text-gray-400 text-center mt-2">You can skip this and set it later</p></div>}
          {currentStep.field === 'anxietyLevel' && currentStep.slider && (
            <div className="px-2">
              <input type="range" min={1} max={5} value={anxietyLevel} onChange={(e) => setAnxietyLevel(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none bg-gray-200" />
              <div className="flex justify-between mt-2">
                {currentStep.labels?.map((label, i) => <span key={i} className={cn('text-[9px] font-medium text-center w-16', anxietyLevel === i + 1 ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400')}>{label}</span>)}
              </div>
              <p className="text-center text-2xl font-extrabold text-brand-600 dark:text-brand-400 mt-4">{anxietyLevel}/5</p>
            </div>
          )}
          {currentStep.field === 'goals' && currentStep.multi && currentStep.options && (
            <div className="space-y-2">
              {currentStep.options.map((opt) => {
                const selected = goals.includes(opt.value)
                return (
                  <button key={opt.value} onClick={() => toggleGoal(opt.value)} className={cn('w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3', selected ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-200 dark:border-gray-700')}>
                    <div className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all', selected ? 'border-brand-500 bg-brand-500' : 'border-gray-300 dark:border-gray-600')}>
                      {selected && <Check size={12} className="text-white" />}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{opt.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <div className="px-6 pb-10 flex items-center gap-3">
        {step > 0 ? <button onClick={goBack} className="btn-secondary px-4 shrink-0"><ChevronLeft size={18} /></button> : <div className="w-12 shrink-0" />}
        <button onClick={goNext} disabled={!canAdvance()} className="btn-primary flex-1">
          {step < steps.length - 1 ? 'Continue' : 'Start Driving'}
          {step < steps.length - 1 && <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  )
}
