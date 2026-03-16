import { useCallback, useEffect, useState } from 'react'
import { checkHealth } from '../api/client'

const POLL_INTERVAL_MS = 15_000

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(false)

  const check = useCallback(async () => {
    try {
      await checkHealth()
      setIsOnline(true)
    } catch {
      setIsOnline(false)
    }
  }, [])

  useEffect(() => {
    check()
    const id = setInterval(check, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [check])

  return isOnline
}
