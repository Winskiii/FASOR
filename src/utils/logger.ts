/**
 * @file logger.ts
 * @description Production-safe logger — menekan console output di environment production
 *              agar informasi internal sistem tidak bocor ke pengguna akhir.
 *
 * Mapping OWASP: A09 — Security Logging and Monitoring Failures
 *
 * Penggunaan:
 *   import { logger } from "@/utils/logger"
 *   logger.log("data", value)    // hanya tampil di development
 *   logger.error("err", error)   // hanya tampil di development
 */

const isDev = process.env.NODE_ENV !== 'production'

export const logger = {
  /** Tampilkan pesan debug — hanya di development */
  log: (...args: unknown[]): void => {
    if (isDev) console.log(...args)
  },
  /** Tampilkan pesan warning — hanya di development */
  warn: (...args: unknown[]): void => {
    if (isDev) console.warn(...args)
  },
  /** Tampilkan pesan error — hanya di development */
  error: (...args: unknown[]): void => {
    if (isDev) console.error(...args)
  },
  /** Tampilkan pesan debug verbose — hanya di development */
  debug: (...args: unknown[]): void => {
    if (isDev) console.debug(...args)
  },
  /** Tampilkan pesan info — hanya di development */
  info: (...args: unknown[]): void => {
    if (isDev) console.info(...args)
  },
}
