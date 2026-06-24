import axios, { CanceledError, isAxiosError } from "axios"

const SIGN_IN_ENDPOINT = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://amu-fasor.local") + "/auth/login"
const CSRF_COOKIE_ENDPOINT = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://amu-fasor.local") + '/csrf-cookie'

const useSignInAction = () => {
	const getCsrfToken = async () => {
		axios.get(CSRF_COOKIE_ENDPOINT)
			.catch((e: any) => {
				if (!isAxiosError(e) && !(e instanceof CanceledError)) throw e
			})
	}

	const signIn = async () => {
		const signInUrl = await axios
			.post(SIGN_IN_ENDPOINT, {}, {
				withCredentials: true,
				xsrfCookieName: 'CSRF-TOKEN',
				xsrfHeaderName: 'X-CSRF-TOKEN',
				withXSRFToken: true
			})
			.then((res) => res.data)
			.catch((e: any) => {
				if (!isAxiosError(e) && !(e instanceof CanceledError)) throw e
			})

		if (signInUrl?.data) {
			window.location.href = signInUrl.data
		}
	}

	return { getCsrfToken, signIn }
}

export { useSignInAction }
