import { useEffect, useRef, useCallback } from "react"
import { clearFrontendAuthState } from "@/utils/auth/SignOutAction"

const IDLE_EVENTS = ["mousemove", "keydown", "mousedown", "scroll", "touchstart"] as const

export const useIdleTimeout = (
	enabled: boolean,
	timeoutMinutes = 25,
	warningMinutes = 2,
	onWarning?: () => void
) => {
	const timerRef = useRef<NodeJS.Timeout | null>(null)
	const warningRef = useRef<NodeJS.Timeout | null>(null)
	const onWarningRef = useRef(onWarning)

	useEffect(() => {
		onWarningRef.current = onWarning
	})

	const clearTimers = useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current)
		if (warningRef.current) clearTimeout(warningRef.current)
	}, [])

	const logout = useCallback(() => {
		clearFrontendAuthState()
		window.location.href = "/login?reason=idle"
	}, [])

	const resetTimers = useCallback(() => {
		clearTimers()

		const timeoutMs = timeoutMinutes * 60 * 1000
		const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000

		warningRef.current = setTimeout(() => {
			onWarningRef.current?.()
		}, warningMs)

		timerRef.current = setTimeout(logout, timeoutMs)
	}, [clearTimers, logout, timeoutMinutes, warningMinutes])

	useEffect(() => {
		if (!enabled) {
			clearTimers()
			return
		}

		IDLE_EVENTS.forEach((e) => window.addEventListener(e, resetTimers))
		resetTimers()

		return () => {
			clearTimers()
			IDLE_EVENTS.forEach((e) => window.removeEventListener(e, resetTimers))
		}
	}, [enabled, resetTimers, clearTimers])
}
