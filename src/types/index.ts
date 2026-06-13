export interface User {
  name: string
  level: string
  levelNumber: number
  xp: number
  xpToNextLevel: number
  testDate: string | null
  testType: 'G2' | 'G' | 'none'
  learningGoals: string[]
  streakDays: number
  totalSessions: number
  joinedDate: string
  avatarUrl: string
}

export interface ConfidenceScore {
  overall: number
  hazardPerception: number
  intersection: number
  lanePositioning: number
  roadTestPrep: number
  realDriving: number
  history: { date: string; score: number }[]
}

// Full types index — all interfaces for the ClearLane app
export type TabId = 'home' | 'practice' | 'drive' | 'progress' | 'profile'
export interface AppSettings {
  darkMode: 'light' | 'dark' | 'system'
  voiceCoach: boolean
  voiceCoachVolume: number
  textSize: 'normal' | 'large' | 'extra_large'
  highContrast: boolean
  reduceMotion: boolean
  hapticFeedback: boolean
  notifications: boolean
  language: 'en' | 'fr'
}
