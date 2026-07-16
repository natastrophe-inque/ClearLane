import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { isSupabaseConfigured, supabase, supabaseSchema } from '@/lib/supabase'

export interface AuthUser {
  id: string
  name: string
  email: string
  testType: 'G2' | 'G' | 'none'
  testDate: string | null
  anxietyLevel: number
  goals: string[]
  voicePref: boolean
  darkMode: 'light' | 'dark' | 'system'
  levelName: string
  levelNumber: number
  xp: number
  streakDays: number
  totalSessions: number
}

interface AuthState {
  isAuthenticated: boolean
  isOnboarded: boolean
  user: AuthUser | null
  userId: string | null
  authLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string) => Promise<boolean>
  completeOnboarding: (data: Partial<AuthUser>) => Promise<void>
  logout: () => void
  updateUser: (patch: Partial<AuthUser>) => void
}

interface StoredSession {
  userId: string | null
  isOnboarded: boolean
}

interface DemoUserRecord extends AuthUser {
  passwordHash: string
}

const SESSION_KEY = 'clearlane-session'
const DEMO_USERS_KEY = 'clearlane-demo-users'
const DEMO_PASSWORD_SALT = 'clearlane-demo-auth'

const defaultUserValues = {
  testType: 'none' as const,
  testDate: null,
  anxietyLevel: 3,
  goals: [] as string[],
  voicePref: false,
  darkMode: 'system' as const,
  levelName: 'Getting Started',
  levelNumber: 1,
  xp: 0,
  streakDays: 0,
  totalSessions: 0,
}

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  isOnboarded: false,
  user: null,
  userId: null,
  authLoading: true,
  login: async () => false,
  signup: async () => false,
  completeOnboarding: async () => {},
  logout: () => {},
  updateUser: () => {},
}

function saveSession(userId: string, isOnboarded: boolean) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId, isOnboarded }))
}

function loadSession(): StoredSession {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredSession>
      return {
        userId: parsed.userId ?? null,
        isOnboarded: parsed.isOnboarded === true,
      }
    }
  } catch {
    // Ignore malformed local state and fall back to a signed-out session.
  }

  return { userId: null, isOnboarded: false }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

function isDemoUserRecord(candidate: unknown): candidate is DemoUserRecord {
  if (typeof candidate !== 'object' || candidate === null) return false

  const value = candidate as Partial<DemoUserRecord>
  return typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.email === 'string'
    && typeof value.passwordHash === 'string'
    && (value.testType === 'G2' || value.testType === 'G' || value.testType === 'none')
    && (value.testDate === null || typeof value.testDate === 'string')
    && typeof value.anxietyLevel === 'number'
    && Array.isArray(value.goals)
    && typeof value.voicePref === 'boolean'
    && (value.darkMode === 'light' || value.darkMode === 'dark' || value.darkMode === 'system')
    && typeof value.levelName === 'string'
    && typeof value.levelNumber === 'number'
    && typeof value.xp === 'number'
    && typeof value.streakDays === 'number'
    && typeof value.totalSessions === 'number'
}

function loadDemoUsers(): DemoUserRecord[] {
  try {
    const raw = localStorage.getItem(DEMO_USERS_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isDemoUserRecord)
  } catch {
    return []
  }
}

function saveDemoUsers(users: DemoUserRecord[]) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users))
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')
}

function constantTimeEquals(left: string, right: string): boolean {
  if (left.length !== right.length) return false

  let mismatch = 0
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }

  return mismatch === 0
}

function matchesNormalizedEmail(candidateEmail: string, normalizedEmail: string): boolean {
  return candidateEmail.trim().toLowerCase() === normalizedEmail
}

async function hashPassword(password: string): Promise<string> {
  if (!('crypto' in globalThis) || !globalThis.crypto.subtle) {
    throw new Error('ClearLane demo mode requires a modern browser with crypto.subtle support. Please use a recent version of Chrome, Firefox, Safari, or Edge.')
  }

  const encoded = new TextEncoder().encode(`${DEMO_PASSWORD_SALT}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return `sha256:${bytesToHex(new Uint8Array(digest))}`
}

function findAuthenticatedDemoUser(users: DemoUserRecord[], normalizedEmail: string, passwordHash: string): DemoUserRecord | undefined {
  return users.find((candidate) => {
    return matchesNormalizedEmail(candidate.email, normalizedEmail)
      && constantTimeEquals(candidate.passwordHash, passwordHash)
  })
}

function updateDemoUsers(users: DemoUserRecord[], userId: string, patch: Partial<AuthUser>): DemoUserRecord[] {
  return users.map((candidate) => {
    if (candidate.id !== userId) return candidate
    return mergeDemoUser(candidate, patch)
  })
}

function createId(): string {
  if ('crypto' in globalThis && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  if ('crypto' in globalThis && typeof globalThis.crypto.getRandomValues === 'function') {
    const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16))
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = bytesToHex(bytes)
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  throw new Error('ClearLane demo mode requires a modern browser with secure random number support.')
}

function mergeDemoUser(record: DemoUserRecord, patch: Partial<AuthUser>): DemoUserRecord {
  return {
    ...record,
    ...patch,
    passwordHash: record.passwordHash,
  }
}

function toAuthUser(record: DemoUserRecord): AuthUser {
  const { passwordHash: _passwordHash, ...user } = record
  return user
}

function dbUserToAuthUser(row: Record<string, unknown>): AuthUser {
  let goals: string[] = []

  try {
    if (typeof row.goals === 'string' && row.goals.trim()) {
      const parsedGoals = JSON.parse(row.goals)
      goals = Array.isArray(parsedGoals)
        ? parsedGoals.filter((goal): goal is string => typeof goal === 'string')
        : []
    } else if (Array.isArray(row.goals)) {
      goals = row.goals.filter((goal): goal is string => typeof goal === 'string')
    }
  } catch {
    goals = []
  }

  if (typeof row.id !== 'string') {
    throw new Error('Supabase user row is missing a string id.')
  }

  return {
    id: row.id,
    name: typeof row.name === 'string' ? row.name : 'Driver',
    email: typeof row.email === 'string' ? row.email : '',
    testType: row.test_type === 'G2' || row.test_type === 'G' ? row.test_type : 'none',
    testDate: typeof row.test_date === 'string' && row.test_date ? row.test_date : null,
    anxietyLevel: typeof row.anxiety_level === 'number' ? row.anxiety_level : defaultUserValues.anxietyLevel,
    goals,
    voicePref: defaultUserValues.voicePref,
    darkMode: defaultUserValues.darkMode,
    levelName: typeof row.level_name === 'string' ? row.level_name : defaultUserValues.levelName,
    levelNumber: typeof row.level_number === 'number' ? row.level_number : defaultUserValues.levelNumber,
    xp: typeof row.xp === 'number' ? row.xp : defaultUserValues.xp,
    streakDays: typeof row.streak_days === 'number' ? row.streak_days : defaultUserValues.streakDays,
    totalSessions: typeof row.total_sessions === 'number' ? row.total_sessions : defaultUserValues.totalSessions,
  }
}

function authPatchToDbPatch(patch: Partial<AuthUser>) {
  const dbPatch: Record<string, unknown> = {}

  if (patch.name !== undefined) dbPatch.name = patch.name
  if (patch.testType !== undefined) dbPatch.test_type = patch.testType
  if (patch.testDate !== undefined) dbPatch.test_date = patch.testDate
  if (patch.anxietyLevel !== undefined) dbPatch.anxiety_level = patch.anxietyLevel
  if (patch.goals !== undefined) dbPatch.goals = JSON.stringify(patch.goals)
  if (patch.levelName !== undefined) dbPatch.level_name = patch.levelName
  if (patch.levelNumber !== undefined) dbPatch.level_number = patch.levelNumber
  if (patch.xp !== undefined) dbPatch.xp = patch.xp
  if (patch.streakDays !== undefined) dbPatch.streak_days = patch.streakDays
  if (patch.totalSessions !== undefined) dbPatch.total_sessions = patch.totalSessions

  return dbPatch
}

const AuthContext = createContext<AuthState>(defaultAuthState)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  const db = useMemo(() => {
    if (!isSupabaseConfigured || !supabase) return null
    return supabase.schema(supabaseSchema)
  }, [])

  const applyAuthenticatedUser = useCallback((nextUser: AuthUser, onboarded: boolean) => {
    setUser(nextUser)
    setUserId(nextUser.id)
    setIsOnboarded(onboarded)
    saveSession(nextUser.id, onboarded)
  }, [])

  useEffect(() => {
    let cancelled = false

    const restoreSession = async () => {
      const session = loadSession()
      if (!session.userId) {
        setAuthLoading(false)
        return
      }

      if (!db) {
        const storedUser = loadDemoUsers().find((candidate) => candidate.id === session.userId)
        if (!storedUser) {
          clearSession()
          if (!cancelled) setAuthLoading(false)
          return
        }

        if (!cancelled) {
          applyAuthenticatedUser(toAuthUser(storedUser), session.isOnboarded)
          setAuthLoading(false)
        }
        return
      }

      const { data, error } = await db
        .from('users')
        .select('*')
        .eq('id', session.userId)
        .maybeSingle()

      if (cancelled) return

      if (error || !data) {
        clearSession()
        setAuthLoading(false)
        return
      }

      const nextUser = dbUserToAuthUser(data as Record<string, unknown>)
      const onboarded = (data as { is_onboarded?: unknown }).is_onboarded === true || session.isOnboarded
      applyAuthenticatedUser(nextUser, onboarded)
      setAuthLoading(false)
    }

    void restoreSession()

    return () => {
      cancelled = true
    }
  }, [applyAuthenticatedUser, db])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const normalizedEmail = email.trim().toLowerCase()
    const passwordHash = await hashPassword(password)

    if (!db) {
      const existing = findAuthenticatedDemoUser(loadDemoUsers(), normalizedEmail, passwordHash)
      if (!existing) return false

      const session = loadSession()
      const onboarded = session.userId === existing.id ? session.isOnboarded : existing.goals.length > 0
      applyAuthenticatedUser(toAuthUser(existing), onboarded)
      return true
    }

    const { data, error } = await db
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('password_hash', passwordHash)
      .maybeSingle()

    if (error || !data) return false

    const nextUser = dbUserToAuthUser(data as Record<string, unknown>)
    const onboarded = (data as { is_onboarded?: unknown }).is_onboarded === true
    applyAuthenticatedUser(nextUser, onboarded)
    return true
  }, [applyAuthenticatedUser, db])

  const signup = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    const normalizedEmail = email.trim().toLowerCase()

    if (!db) {
      const users = loadDemoUsers()
      if (users.some((candidate) => matchesNormalizedEmail(candidate.email, normalizedEmail))) {
        return false
      }

      const newUser: DemoUserRecord = {
        id: createId(),
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: await hashPassword(password),
        ...defaultUserValues,
      }

      saveDemoUsers([...users, newUser])
      applyAuthenticatedUser(toAuthUser(newUser), false)
      return true
    }

    const { data: existing } = await db
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existing) return false

    const { data, error } = await db
      .from('users')
      .insert({
        name: name.trim(),
        email: normalizedEmail,
        password_hash: await hashPassword(password),
        is_onboarded: false,
        test_type: defaultUserValues.testType,
        level_name: defaultUserValues.levelName,
        level_number: defaultUserValues.levelNumber,
        xp: defaultUserValues.xp,
        streak_days: defaultUserValues.streakDays,
        total_sessions: defaultUserValues.totalSessions,
      })
      .select('*')
      .single()

    if (error || !data) return false

    applyAuthenticatedUser(dbUserToAuthUser(data as Record<string, unknown>), false)
    return true
  }, [applyAuthenticatedUser, db])

  const completeOnboarding = useCallback(async (data: Partial<AuthUser>) => {
    if (!userId) return

    if (!db) {
      const users = loadDemoUsers()
      const existingUser = users.find((candidate) => candidate.id === userId)
      if (!existingUser) return

      const nextUsers = updateDemoUsers(users, userId, {
        ...data,
        name: data.name ?? existingUser.name,
      })

      saveDemoUsers(nextUsers)
      setUser((previous) => previous ? { ...previous, ...data } : previous)
      setIsOnboarded(true)
      saveSession(userId, true)
      return
    }

    const { error } = await db
      .from('users')
      .update({
        ...authPatchToDbPatch(data),
        is_onboarded: true,
      })
      .eq('id', userId)

    if (error) return

    setUser((previous) => previous ? { ...previous, ...data } : previous)
    setIsOnboarded(true)
    saveSession(userId, true)
  }, [db, userId])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
    setUserId(null)
    setIsOnboarded(false)
  }, [])

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((previous) => {
      if (!previous) return previous
      const nextUser = { ...previous, ...patch }

      if (!db) {
        const users = loadDemoUsers()
        saveDemoUsers(updateDemoUsers(users, nextUser.id, patch))
      } else {
        void db
          .from('users')
          .update(authPatchToDbPatch(patch))
          .eq('id', nextUser.id)
      }

      return nextUser
    })
  }, [db])

  const value: AuthState = {
    isAuthenticated: user !== null,
    isOnboarded,
    user,
    userId,
    authLoading,
    login,
    signup,
    completeOnboarding,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  return useContext(AuthContext)
}
