import { useState, useRef, useCallback } from "react"

/**
 * Client-side API rate limiter to prevent double-clicks and rapid-fire submissions.
 *
 * Security: Rate Limiting (OWASP A04 — Insecure Design)
 * Wraps async API calls with:
 * - Debounce protection: prevents firing while a request is already in-flight
 * - Cooldown: enforces a minimum delay between consecutive calls
 * - Attempt tracking: blocks after too many failed attempts
 *
 * @param cooldownMs     - Minimum milliseconds between calls (default: 1000)
 * @param maxAttempts    - Max consecutive failures before blocking (default: 10)
 * @param blockDurationMs - How long to block after maxAttempts failures (default: 30000)
 */
export const useApiRateLimit = (
	cooldownMs = 1000,
	maxAttempts = 10,
	blockDurationMs = 30000
) => {
	const [isInFlight, setIsInFlight] = useState(false)
	const [isBlocked, setIsBlocked] = useState(false)
	const [blockCountdown, setBlockCountdown] = useState(0)
	const failureCount = useRef(0)
	const lastCallTime = useRef(0)
	const countdownRef = useRef<NodeJS.Timeout | null>(null)

	const startBlockCountdown = useCallback(() => {
		setIsBlocked(true)
		setBlockCountdown(Math.ceil(blockDurationMs / 1000))

		const tick = () => {
			setBlockCountdown(prev => {
				if (prev <= 1) {
					setIsBlocked(false)
					failureCount.current = 0
					return 0
				}
				countdownRef.current = setTimeout(tick, 1000)
				return prev - 1
			})
		}
		countdownRef.current = setTimeout(tick, 1000)
	}, [blockDurationMs])

	/**
	 * Wraps an async function with rate limiting.
	 * Returns the result of the wrapped function, or undefined if rate-limited.
	 */
	const rateLimitedCall = useCallback(async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
		// Check if blocked
		if (isBlocked) return undefined

		// Check if already in-flight (prevent double-clicks)
		if (isInFlight) return undefined

		// Check cooldown
		const now = Date.now()
		if (now - lastCallTime.current < cooldownMs) return undefined

		setIsInFlight(true)
		lastCallTime.current = now

		try {
			const result = await fn()
			// Success: reset failure count
			failureCount.current = 0
			return result
		} catch (error) {
			// Track failures
			failureCount.current += 1
			if (failureCount.current >= maxAttempts) {
				startBlockCountdown()
			}
			throw error
		} finally {
			setIsInFlight(false)
		}
	}, [isBlocked, isInFlight, cooldownMs, maxAttempts, startBlockCountdown])

	const reset = useCallback(() => {
		failureCount.current = 0
		setIsBlocked(false)
		setBlockCountdown(0)
		setIsInFlight(false)
		if (countdownRef.current) clearTimeout(countdownRef.current)
	}, [])

	return {
		rateLimitedCall,
		isInFlight,
		isBlocked,
		blockCountdown,
		reset,
	}
}
