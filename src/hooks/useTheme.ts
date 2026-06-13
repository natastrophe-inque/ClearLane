import { useState, useEffect, useCallback } from 'react'
import type { AppSettings } from '@/types'

const STORAGE_KEY = 'clearlane-settings'

const defaults: AppSettings = {
  darkMode: 'system',
  voiceCoach: false,
  voiceCoachVolume: 80,
  textSize: 'normal',
  highContrast: false,
  reduceMotion: false,
  hapticFeedback: true,
  notifications: true,
  language: 'en',
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaults, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return defaults
}

export function useTheme() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings)

  const resolvedMode = useCallback((): 'dark' | 'light' => {
    if (settings.darkMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return settings.darkMode
  }, [settings.darkMode])

  const [isDark, setIsDark] = useState(resolvedMode() === 'dark')

  useEffect(() => {
    const root = document.documentElement
    const dark = resolvedMode() === 'dark'
    setIsDark(dark)
    root.classList.toggle('dark', dark)
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
  }, [settings, resolvedMode])

  useEffect(() => {
    if (settings.darkMode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const dark = mq.matches
      setIsDark(dark)
      document.documentElement.classList.toggle('dark', dark)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [settings.darkMode])

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { settings, isDark, updateSettings }
}
