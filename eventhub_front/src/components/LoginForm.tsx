import React, { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { OtpVerification } from './OtpVerification'
import { AuthError } from '../shared/errors/AuthError'

interface Props {
  onSuccess?: () => void
}

export const LoginForm: React.FC<Props> = ({ onSuccess }) => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [requiresOtp, setRequiresOtp] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      if (onSuccess) onSuccess()
    } catch (err) {
      if (err instanceof AuthError && err.code === 'OTP_REQUIRED') {
        setRequiresOtp(true)
      } else {
        setError(err instanceof Error ? err.message : 'Erreur de connexion')
      }
    } finally {
      setLoading(false)
    }
  }

  if (requiresOtp) {
    return (
      <OtpVerification
        email={email}
        password={password}
        onSuccess={onSuccess}
        onCancel={() => setRequiresOtp(false)}
      />
    )
  }

  return (
    <form className="card login-form" onSubmit={handleSubmit}>
      <h2>Connexion</h2>
      <p className="muted">Connectez-vous pour voir tous les événements.</p>
      {error && <p className="state-message state-error">{error}</p>}
      <label>
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="vous@example.com"
        />
      </label>
      <label>
        <span>Mot de passe</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />
      </label>
      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  )
}


