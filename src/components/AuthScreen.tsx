import { useState } from 'react'
import { ChevronLeft, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'

interface AuthScreenProps {
  mode: 'signin' | 'signup'
  onBack: () => void
  onSignIn: (email: string, password: string) => Promise<boolean>
  onSignUp: (email: string, password: string, name: string) => Promise<boolean>
}

export default function AuthScreen({ mode: initialMode, onBack, onSignIn, onSignUp }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (password.length < 3) {
      setError('Password must be at least 3 characters')
      return
    }
    if (mode === 'signup' && name.trim().length < 2) {
      setError('Please enter your name')
      return
    }

    setLoading(true)
    if (mode === 'signin') {
      const ok = await onSignIn(email, password)
      if (!ok) {
        setError('No account found with that email and password.')
        setLoading(false)
      }
    } else {
      const ok = await onSignUp(email, password, name)
      if (!ok) {
        setError('An account with that email already exists.')
        setLoading(false)
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-surface-dark">
      <div className="px-4 pt-safe pt-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <div className="flex-1 flex flex-col px-6 pt-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🛣️</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {mode === 'signin' ? 'Sign in to continue your journey' : 'Start building your driving confidence'}
          </p>
        </div>
        <div className="space-y-3">
          {mode === 'signup' && <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="input" />}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="input" />
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input" />
          {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-4 text-base mt-2">
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </div>
        <p className="text-center text-sm mt-6">
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }} className="text-brand-600 font-semibold">
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}