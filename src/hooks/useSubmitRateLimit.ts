import { useState, useEffect, useRef } from "react"

export const useSubmitRateLimit = (maxAttempts = 5, cooldownSeconds = 15) => {
  const [attempts, setAttempts] = useState(0)
  const [cooldown, setCooldown] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const isBlocked = cooldown > 0

  const recordFailure = () => {
    setAttempts(prev => {
      const next = prev + 1
      if (next >= maxAttempts) {
        setCooldown(cooldownSeconds)
      }
      return next
    })
  }

  const reset = () => {
    setAttempts(0)
    setCooldown(0)
  }

  useEffect(() => {
    if (cooldown <= 0) return
    timerRef.current = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [cooldown])

  return { isBlocked, cooldown, attempts, recordFailure, reset }
}