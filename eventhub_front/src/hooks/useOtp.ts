import { useState, useCallback } from 'react'
import { getQrCode, enableOtp, disableOtp, regenerateBackupCodes } from '../api/client'

export function useOtp() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enable = async (secret: string, code: string): Promise<string[]> => {
    setLoading(true)
    setError(null)
    try {
      const backupCodes = await enableOtp(secret, code)
      return backupCodes
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'activation de l\'OTP'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const disable = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await disableOtp()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la désactivation de l\'OTP'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const regenerateCodes = async (): Promise<string[]> => {
    setLoading(true)
    setError(null)
    try {
      const codes = await regenerateBackupCodes()
      return codes
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la régénération des codes'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getQr = useCallback(async (): Promise<{ image: string; username: string; secret: string }> => {
    setLoading(true)
    setError(null)
    try {
      const qr = await getQrCode()
      return qr
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la récupération du QR code'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    enable,
    disable,
    regenerateCodes,
    getQr,
    loading,
    error,
  }
}

