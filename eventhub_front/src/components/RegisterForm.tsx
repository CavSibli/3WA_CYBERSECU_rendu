import React, { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

interface Props {
  onSuccess?: () => void
}

export const RegisterForm: React.FC<Props> = ({ onSuccess }) => {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register(email, name, password)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="card login-form" onSubmit={handleSubmit}>
      <h2>Inscription</h2>
      <p className="muted">Créez un compte pour accéder à tous les événements.</p>
      {error && <p className="state-message state-error">{error}</p>}
      <label>
        <span>Nom</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Votre nom"
        />
      </label>
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
          minLength={6}
        />
      </label>
      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? 'Inscription...' : "S'inscrire"}
      </button>
    </form>
  )
}

