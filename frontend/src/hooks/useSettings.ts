import { useCallback, useState } from 'react'

export type CardFace = 'irish' | 'english'

interface Settings {
  cardFace: CardFace
}

const STORAGE_KEY = 'gaeilge-settings'
const DEFAULTS: Settings = { cardFace: 'irish' }

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULTS }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // storage quota exceeded — ignore
      }
      return next
    })
  }, [])

  return { settings, updateSettings }
}
