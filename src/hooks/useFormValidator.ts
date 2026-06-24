import { useState, useCallback, useMemo } from "react"

/**
 * Validation rules for common form fields.
 *
 * Security: Server-Side Validation (OWASP A03 — Injection)
 * All data must be validated client-side before sending to the API.
 * This acts as the first line of defense; the backend validates again.
 */

// ── Regex patterns ──────────────────────────────────────────────────────
const PATTERNS = {
	email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	phone: /^(\+62|62|0)[0-9]{8,13}$/,
	nik: /^[0-9]{16}$/,
	password: /^.{8,}$/,
	alphaOnly: /^[a-zA-Z\s'.,-]+$/,
	noScript: /<script[\s>]|javascript:|on\w+\s*=/i,
} as const

// ── Validation functions ────────────────────────────────────────────────
export const validators = {
	/** Email must be a valid format */
	email: (value: string): string | null => {
		if (!value) return "Email wajib diisi"
		if (!PATTERNS.email.test(value.trim())) return "Format email tidak valid"
		if (value.length > 255) return "Email terlalu panjang (maksimal 255 karakter)"
		return null
	},

	/** Password must be at least 8 characters */
	password: (value: string): string | null => {
		if (!value) return "Password wajib diisi"
		if (value.length < 8) return "Password minimal 8 karakter"
		if (value.length > 128) return "Password terlalu panjang"
		return null
	},

	/** Confirm password must match the original */
	confirmPassword: (value: string, original: string): string | null => {
		if (!value) return "Konfirmasi password wajib diisi"
		if (value !== original) return "Password tidak cocok"
		return null
	},

	/** Name: non-empty, no script injection, reasonable length */
	name: (value: string): string | null => {
		if (!value || !value.trim()) return "Nama wajib diisi"
		if (value.trim().length < 2) return "Nama minimal 2 karakter"
		if (value.length > 200) return "Nama terlalu panjang (maksimal 200 karakter)"
		if (PATTERNS.noScript.test(value)) return "Nama mengandung karakter tidak valid"
		return null
	},

	/** NIK: exactly 16 digits */
	nik: (value: string): string | null => {
		if (!value) return "NIK wajib diisi"
		if (!PATTERNS.nik.test(value)) return "NIK harus 16 digit angka"
		return null
	},

	/** Phone: Indonesian format */
	phone: (value: string): string | null => {
		if (!value || !value.trim()) return "Nomor telepon wajib diisi"
		const cleaned = value.replace(/[\s\-()]/g, "")
		if (!PATTERNS.phone.test(cleaned)) return "Format nomor telepon tidak valid (contoh: 08xx atau +62xx)"
		return null
	},

	/** Generic required field */
	required: (value: string, fieldName = "Field"): string | null => {
		if (!value || !value.trim()) return `${fieldName} wajib diisi`
		return null
	},

	/** Number: must be a valid positive number */
	positiveNumber: (value: string | number, fieldName = "Nilai"): string | null => {
		const num = typeof value === "string" ? Number(value) : value
		if (isNaN(num)) return `${fieldName} harus berupa angka`
		if (num < 0) return `${fieldName} tidak boleh negatif`
		return null
	},

	/** Price/tarif: must be a valid positive integer */
	price: (value: string | number, fieldName = "Harga"): string | null => {
		const num = typeof value === "string" ? Number(value) : value
		if (isNaN(num)) return `${fieldName} harus berupa angka`
		if (num < 0) return `${fieldName} tidak boleh negatif`
		if (!Number.isInteger(num)) return `${fieldName} harus bilangan bulat`
		return null
	},

	/** Generic text: check for script injection */
	safeText: (value: string, fieldName = "Teks"): string | null => {
		if (PATTERNS.noScript.test(value)) return `${fieldName} mengandung karakter tidak valid`
		if (value.length > 5000) return `${fieldName} terlalu panjang`
		return null
	},
}

// ── Hook ────────────────────────────────────────────────────────────────

type FieldErrors = Record<string, string | null>
type FieldValidators = Record<string, () => string | null>

/**
 * Centralized form validation hook.
 *
 * Usage:
 * ```tsx
 * const { errors, validate, validateAll, clearError, isValid } = useFormValidator({
 *   email: () => validators.email(email),
 *   password: () => validators.password(password),
 *   name: () => validators.name(name),
 * })
 * ```
 */
export const useFormValidator = (fieldValidators: FieldValidators) => {
	const [errors, setErrors] = useState<FieldErrors>({})

	/** Validate a single field */
	const validate = useCallback((field: string): boolean => {
		const validator = fieldValidators[field]
		if (!validator) return true

		const error = validator()
		setErrors(prev => ({ ...prev, [field]: error }))
		return error === null
	}, [fieldValidators])

	/** Validate all fields. Returns true if all pass. */
	const validateAll = useCallback((): boolean => {
		const newErrors: FieldErrors = {}
		let allValid = true

		for (const [field, validator] of Object.entries(fieldValidators)) {
			const error = validator()
			newErrors[field] = error
			if (error !== null) allValid = false
		}

		setErrors(newErrors)
		return allValid
	}, [fieldValidators])

	/** Clear error for a specific field */
	const clearError = useCallback((field: string) => {
		setErrors(prev => ({ ...prev, [field]: null }))
	}, [])

	/** Clear all errors */
	const clearAll = useCallback(() => {
		setErrors({})
	}, [])

	/** Whether all fields are currently error-free */
	const isValid = useMemo(() => {
		return Object.values(errors).every(e => e === null || e === undefined)
	}, [errors])

	return {
		errors,
		validate,
		validateAll,
		clearError,
		clearAll,
		isValid,
	}
}
