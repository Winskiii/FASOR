import axios from "axios"

let interceptorId: number | null = null

/**
 * Public paths where 401 errors should NOT trigger a redirect to login.
 * These pages are accessible without authentication.
 */
const PUBLIC_PATHS = [
	"/",
	"/sewa-lapangan",
	"/gor-bulutangkis",
	"/gor-futsal",
	"/lapangan-basket-flexy",
	"/lapangan-basket-semi-indoor",
	"/lapangan-futsal-pln",
	"/lapangan-mini-soccer",
	"/lapangan-tenis",
	"/lapangan-voli",
	"/stadion-its",
	"/pengumuman",
	"/riwayat-pemesanan",
	"/cek-pemesanan",
	"/daftar",
	"/konfirmasi-reservasi",
	"/detail-pemesanan",
]

const isPublicPath = (): boolean => {
	if (typeof window === "undefined") return false
	const pathname = window.location.pathname
	return PUBLIC_PATHS.some(p =>
		pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p + "?")
	)
}

/**
 * Global Axios configuration for authentication, CSRF protection, and rate limiting.
 *
 * Security features:
 * - withCredentials: true on ALL requests (sends session cookies to backend)
 * - CSRF token headers (X-CSRF-TOKEN / XSRF-TOKEN) sent automatically
 * - 401 handler: redirects to login when session expires (skips on public pages)
 * - 429 handler: shows rate limit warning and prevents request flooding
 * - 403 handler: logs unauthorized access attempts
 */
export const setupAxiosInterceptors = () => {
	// ── Global Defaults ─────────────────────────────────────────────────
	// Ensure ALL requests send session cookies (critical for auth)
	axios.defaults.withCredentials = true

	// CSRF protection: automatically read CSRF token from cookie and send in header
	axios.defaults.xsrfCookieName = "CSRF-TOKEN"
	axios.defaults.xsrfHeaderName = "X-CSRF-TOKEN"
	axios.defaults.withXSRFToken = true

	// Default headers for JSON API communication
	axios.defaults.headers.common["Accept"] = "application/json"
	axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest"

	// ── Clear previous interceptors ─────────────────────────────────────
	axios.interceptors.request.clear()

	if (interceptorId !== null) return

	// ── Rate limit tracking (client-side) ───────────────────────────────
	let rateLimitedUntil = 0

	// ── Request interceptor: block requests during rate limit cooldown ──
	axios.interceptors.request.use(
		(config) => {
			if (Date.now() < rateLimitedUntil) {
				return Promise.reject(new axios.Cancel(
					"Terlalu banyak permintaan. Silakan tunggu beberapa saat."
				))
			}
			return config
		},
		(error) => Promise.reject(error)
	)

	// ── Response interceptor: handle auth & rate limit errors ───────────
	interceptorId = axios.interceptors.response.use(
		(response) => response,
		(error) => {
			const status = error?.response?.status

			// 401 Unauthorized — session expired
			if (status === 401) {
				// Skip redirect on public pages (fixes incognito mode issue)
				if (isPublicPath()) {
					return Promise.reject(error)
				}

				const wasLoggedIn = typeof sessionStorage !== "undefined" && sessionStorage.getItem("fasor_logged_in") === "true"

				if (wasLoggedIn) {
					sessionStorage.removeItem("fasor_logged_in")
					sessionStorage.removeItem("fasor_admin_logged_in")
					localStorage.removeItem("fasor_auth_cache")

					if (!window.location.pathname.startsWith("/login")) {
						window.location.href = "/login?reason=session"
					}
				}
			}

			// 429 Too Many Requests — rate limited by backend
			if (status === 429) {
				// Block further requests for 15 seconds
				rateLimitedUntil = Date.now() + 15_000

				// Auto-clear after cooldown
				setTimeout(() => {
					rateLimitedUntil = 0
				}, 15_000)

				console.warn("[Rate Limit] Server returned 429. Blocking requests for 15s.")
			}

			// 403 Forbidden — insufficient permissions (row-level security)
			if (status === 403) {
				console.warn("[Auth] Access denied (403). User may not have permission for this resource.")
			}

			return Promise.reject(error)
		}
	)
}

export const ejectAxiosInterceptors = () => {
	if (interceptorId !== null) {
		axios.interceptors.response.eject(interceptorId)
		interceptorId = null
	}
}
