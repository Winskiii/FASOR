import DOMPurify from "dompurify"

export const sanitizeText = (input: string): string => {
  if (typeof window === "undefined") return input
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
}
export const sanitizeNumber = (input: string): string => {
  return input.replace(/[^\d]/g, "")
}
export const sanitizePhone = (input: string): string => {
  return input.replace(/[^\d+]/g, "")
}
export const sanitizeAlphaNumeric = (input: string): string => {
  if (typeof window === "undefined") return input
  const clean = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
  return clean.replace(/[<>{}]/g, "")
}
export const sanitizePrice = (input: string): string => {
  return input.replace(/[^\d]/g, "")
}
export const sanitizeEmail = (input: string): string => {
  if (typeof window === "undefined") return input.trim().toLowerCase()
  const clean = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
  return clean.trim().toLowerCase()
}
