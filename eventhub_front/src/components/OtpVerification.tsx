import React, { useState } from 'react'
import { verifyOtpLogin } from '../api/client'
import { useAuth } from '../auth/AuthContext'

interface Props {
  email: string
  password: string
  onSuccess?: () => void
  onCancel?: () => void
}

export const OtpVerification: React.FC<Props> = ({ email, password, onSuccess, onCancel }) => {
  const { refreshUser } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await verifyOtpLogin(email, password, code)
      // Le token est dans le cookie httpOnly, mettre à jour le contexte
      await refreshUser()
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code OTP invalide')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Accepter les codes OTP (6 chiffres) ou les codes de secours (8 caractères alphanumériques)
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    // Limiter à 8 caractères (6 pour OTP, 8 pour codes de secours)
    setCode(value.slice(0, 8))
  }

  const isValidCode = code.length === 6 || code.length === 8

  return (
    <form className="card login-form" onSubmit={handleSubmit}>
      <h2>Vérification OTP</h2>
      <p className="muted">
        Entrez le code à 6 chiffres de votre application d'authentification, ou un code de secours à 8 caractères.
      </p>
      {error && <p className="state-message state-error">{error}</p>}
      <label>
        <span>Code OTP ou code de secours</span>
        <input
          type="text"
          value={code}
          onChange={handleCodeChange}
          required
          placeholder="123456 ou A1B2C3D4"
          maxLength={8}
          pattern="[A-Z0-9]{6,8}"
        />
      </label>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {onCancel && (
          <button type="button" className="secondary-button" onClick={onCancel} disabled={loading}>
            Annuler
          </button>
        )}
        <button type="submit" className="primary-button" disabled={loading || !isValidCode}>
          {loading ? 'Vérification...' : 'Vérifier'}
        </button>
      </div>
    </form>
  )
}
