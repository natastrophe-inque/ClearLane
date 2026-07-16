import { useState } from 'react'
import {
  CheckCircle2,
  CloudOff,
  Database,
  LogOut,
  Moon,
  PlayCircle,
  ShieldCheck,
  Sun,
  Terminal,
} from 'lucide-react'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import WelcomeScreen from '@/components/WelcomeScreen'
import OnboardingWizard from '@/components/OnboardingWizard'
import AuthScreen from '@/components/AuthScreen'
import { useTheme } from '@/hooks/useTheme'
import { isSupabaseConfigured, missingSupabaseEnvVars } from '@/lib/supabase'

const demoHighlights = [
  'Step through the welcome, signup, signin, and onboarding flows with no secrets.',
  'Persist local demo accounts in your browser so refreshes keep your state.',
  'Toggle theme settings and inspect the mobile-first UI shell while you build.',
]

const practicePlan = [
  {
    title: 'Warm up your confidence',
    description: 'Review your goals, note how you feel today, and pick one easy driving win.',
  },
  {
    title: 'Prep your next practice drive',
    description: 'Use demo mode to iterate on UI and content before wiring in Supabase-backed data.',
  },
  {
    title: 'Enable Supabase when ready',
    description: 'Copy .env.example to .env.local and fill in the real values to switch out of demo mode.',
  },
]

function Dashboard() {
  const { logout, user } = useAuth()
  const { settings, updateSettings } = useTheme()

  if (!user) return null

  const toggleTheme = () => {
    updateSettings({ darkMode: settings.darkMode === 'dark' ? 'light' : 'dark' })
  }

  return (
    <div className="app-shell">
      <div className="flex-1 overflow-y-auto px-6 pb-10 pt-safe pt-8 space-y-6">
        <header className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-brand-600 dark:text-brand-400">Welcome back</p>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{user.name || 'Driver'}</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {isSupabaseConfigured
                  ? 'ClearLane is running locally with Supabase enabled.'
                  : 'ClearLane is running locally in demo mode with browser-only storage.'}
              </p>
            </div>
            <button onClick={toggleTheme} className="btn-secondary btn-sm px-3" aria-label="Toggle theme">
              {settings.darkMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div className="card gradient-brand text-white border-0">
            <div className="flex items-center gap-3">
              {isSupabaseConfigured ? <Database size={20} /> : <CloudOff size={20} />}
              <div>
                <p className="text-sm font-semibold">{isSupabaseConfigured ? 'Supabase connected' : 'Local demo mode active'}</p>
                <p className="text-xs text-white/80">
                  {isSupabaseConfigured
                    ? 'Backend-backed auth flows are enabled for this environment.'
                    : 'Missing environment variables are handled gracefully so you can keep developing.'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {!isSupabaseConfigured && (
          <section className="card space-y-3">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
              <ShieldCheck size={18} className="text-brand-600 dark:text-brand-400" />
              <h2 className="text-base font-bold">Optional Supabase setup</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              You can keep using the app without secrets. To enable backend-backed data later, provide these variables in <code>.env.local</code>:
            </p>
            <div className="flex flex-wrap gap-2">
              {missingSupabaseEnvVars.map((variable) => (
                <span key={variable} className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                  {variable}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="card space-y-4">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
            <PlayCircle size={18} className="text-brand-600 dark:text-brand-400" />
            <h2 className="text-base font-bold">Local dev checklist</h2>
          </div>
          <div className="space-y-3">
            {demoHighlights.map((highlight) => (
              <div key={highlight} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-500" />
                <p className="text-sm text-gray-600 dark:text-gray-300">{highlight}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1 text-gray-900 dark:text-white">
            <Terminal size={18} className="text-brand-600 dark:text-brand-400" />
            <h2 className="text-base font-bold">Suggested next steps</h2>
          </div>
          {practicePlan.map((item) => (
            <article key={item.title} className="card-interactive">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="card space-y-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Your profile snapshot</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-400">Road test</dt>
              <dd className="font-semibold text-gray-900 dark:text-white">{user.testType === 'none' ? 'Still exploring' : user.testType}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Anxiety level</dt>
              <dd className="font-semibold text-gray-900 dark:text-white">{user.anxietyLevel}/5</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-gray-400">Goals</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {user.goals.length > 0 ? user.goals.map((goal) => (
                  <span key={goal} className="badge bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">{goal}</span>
                )) : <span className="text-gray-500 dark:text-gray-400">Complete onboarding to personalize this dashboard.</span>}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
        <button onClick={logout} className="btn-secondary w-full">
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </div>
  )
}

function MainApp() {
  const { isAuthenticated, isOnboarded, authLoading, login, signup, completeOnboarding } = useAuth()
  const [authScreenMode, setAuthScreenMode] = useState<'signin' | 'signup'>('signup')
  const [showAuth, setShowAuth] = useState(false)

  if (authLoading) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-brand">
            <span className="text-2xl">🛣️</span>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading ClearLane…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (showAuth) {
      return (
        <div className="app-shell">
          <AuthScreen
            mode={authScreenMode}
            onBack={() => setShowAuth(false)}
            onSignIn={login}
            onSignUp={signup}
            notice={isSupabaseConfigured ? undefined : 'Demo mode stores credentials in this browser only. Never use a real password in demo mode.'}
          />
        </div>
      )
    }

    return (
      <div className="app-shell">
        <WelcomeScreen
          onGetStarted={() => {
            setAuthScreenMode('signup')
            setShowAuth(true)
          }}
          onSignIn={() => {
            setAuthScreenMode('signin')
            setShowAuth(true)
          }}
        />
      </div>
    )
  }

  if (!isOnboarded) {
    return (
      <div className="app-shell">
        <OnboardingWizard onComplete={completeOnboarding} />
      </div>
    )
  }

  return <Dashboard />
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}
