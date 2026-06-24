import { useEffect, useRef } from "react"
import { useRouter } from "next/router"
import useSWRImmutable from "swr/immutable"
import { useAuth } from "@/services/useAuth"

/**
 * Auth guard hook for protecting pages/layouts.
 * Checks if the user is authenticated and (optionally) has the required role.
 *
 * Security: Row-Level Security (OWASP A01 — Broken Access Control)
 * Ensures users can only access resources appropriate for their role.
 *
 * @param options.requiredUserType  - If set, only users of this type can access
 * @param options.requiredRoles     - If set, user must have at least one of these roles
 * @param options.redirectTo        - Where to redirect unauthorized users (default: "/login")
 * @param options.enabled           - Whether the guard is active (default: true)
 *
 * @returns { isAuthorized, isLoading, auth }
 */
export const useAuthGuard = (options: {
	requiredUserType?: "internal" | "external"
	requiredRoles?: string[]
	redirectTo?: string
	enabled?: boolean
} = {}) => {
	const {
		requiredUserType,
		requiredRoles,
		redirectTo = "/login",
		enabled = true,
	} = options

	const router = useRouter()
	const hasRedirected = useRef(false)

	const { data: auth, isValidating } = useSWRImmutable("auth", useAuth, {
		refreshInterval: 60000,
		revalidateIfStale: false,
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
	})

	const isLoading = !auth || isValidating
	const isAuthenticated = auth?.status === "authenticated"

	// Check user type
	const hasCorrectUserType = !requiredUserType || auth?.user_type === requiredUserType

	// Check roles (user must have at least one of the required roles)
	const hasRequiredRole = !requiredRoles || requiredRoles.length === 0 || (
		auth?.role && Array.isArray(auth.role) &&
		auth.role.some((r: any) => {
			const roleName = typeof r === "string" ? r : r?.role_name
			return requiredRoles.includes(roleName)
		})
	)

	// Check group-based access (for admin, check if user is in admin groups)
	const hasAdminAccess = !requiredRoles?.includes("Administrator") || (
		auth?.group && Array.isArray(auth.group) &&
		auth.group.some((g: string) =>
			["Dosen", "Tendik", "Pegawai", "THL"].includes(g)
		)
	) || (
		auth?.active_role && (
			(typeof auth.active_role === "string" && auth.active_role === "Administrator") ||
			(typeof auth.active_role === "object" && (auth.active_role as any)?.name === "Administrator")
		)
	)

	const isAuthorized = isAuthenticated && hasCorrectUserType && hasRequiredRole && hasAdminAccess

	useEffect(() => {
		if (!enabled || isLoading || hasRedirected.current) return

		if (!isAuthenticated) {
			hasRedirected.current = true
			const currentPath = router.asPath
			router.replace(`${redirectTo}?next=${encodeURIComponent(currentPath)}`)
			return
		}

		if (!isAuthorized) {
			hasRedirected.current = true
			router.replace("/")
			return
		}
	}, [enabled, isLoading, isAuthenticated, isAuthorized, redirectTo, router])

	// Reset redirect flag on route change
	useEffect(() => {
		hasRedirected.current = false
	}, [router.pathname])

	return {
		isAuthorized,
		isLoading,
		auth,
		isAuthenticated,
	}
}
