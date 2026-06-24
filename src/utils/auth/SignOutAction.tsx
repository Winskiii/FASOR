import axios from "axios"
import { mutate } from "swr"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://amu-fasor.local"
const SIGN_OUT_SSO_ENDPOINT = BACKEND_URL + "/logout"
const SIGN_OUT_EXTERNAL_ENDPOINT = BACKEND_URL + "/auth/logout-external"

/**
 * Clears all frontend auth state (localStorage, sessionStorage, SWR cache).
 * Called before making the actual backend logout call.
 */
const clearFrontendAuthState = () => {
	// Clear all session/local storage keys related to auth
	sessionStorage.removeItem("fasor_logged_in")
	sessionStorage.removeItem("fasor_admin_logged_in")
	localStorage.removeItem("fasor_auth_cache")

	// Invalidate SWR cache so useAuth re-fetches (will get 401 → unauthenticated)
	mutate("auth", undefined, { revalidate: false })
}

const useSignOutAction = () => {
	/**
	 * Sign out the user. Handles both SSO (internal) and external (email/password) users.
	 *
	 * @param userType - "internal" for SSO users, "external" for email/password users.
	 *                   If undefined, tries external logout first, then SSO logout.
	 */
	const signOut = async (userType?: "internal" | "external") => {
		try {
			// Step 1: Clear all frontend state immediately
			clearFrontendAuthState()

			// Step 2: Call the correct backend logout endpoint
			if (userType === "external") {
				// External user: POST to /auth/logout-external to destroy server session
				await axios.post(SIGN_OUT_EXTERNAL_ENDPOINT, {}, {
					withCredentials: true,
					headers: {
						Accept: "application/json",
						"X-Requested-With": "XMLHttpRequest",
					},
				}).catch(() => {
					// Even if external logout fails, continue with redirect
				})

				// Redirect to landing page after external logout
				window.location.href = "/"
				return
			}

			if (userType === "internal") {
				// SSO user: navigate to GET /logout which handles OIDC logout flow
				window.location.href = "/"
				return
			}

			// Unknown user type: try external logout first, then SSO logout
			// This handles edge cases where auth data hasn't loaded yet
			try {
				await axios.post(SIGN_OUT_EXTERNAL_ENDPOINT, {}, {
					withCredentials: true,
					headers: {
						Accept: "application/json",
						"X-Requested-With": "XMLHttpRequest",
					},
				})
			} catch {
				// Ignore — the user might not be an external user
			}

			// Then do SSO logout (this is a full page redirect, covers SSO users)
			window.location.href = "/"

		} catch (e) {
			console.error("Error during signout:", e)
			// Last resort: just redirect to landing page
			window.location.href = "/"
		}
	}

	return { signOut }
}

export { useSignOutAction, clearFrontendAuthState }

