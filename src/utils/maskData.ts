/**
 * Mask sensitive data for display (OWASP A02 — Cryptographic Failures).
 * Never show full NIK or phone number in UI.
 */

export const maskNik = (nik: string): string => {
  if (!nik || nik.length < 8) return nik
  return nik.slice(0, 4) + "****" + nik.slice(-4)
}

export const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 6) return phone
  return phone.slice(0, 4) + "****" + phone.slice(-3)
}
