import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { fetchAllEvents } from '../api/client'
import { useOtp } from '../hooks/useOtp'
import type { Event } from '../types/Event'
import { EventList } from '../components/EventList'
import { LoginForm } from '../components/LoginForm'
import { RegisterForm } from '../components/RegisterForm'
import { OtpSetup } from '../components/OtpSetup'

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { enable, disable, regenerateCodes, loading: otpLoading, error: otpError } = useOtp()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRegister, setShowRegister] = useState(false)
  const [showOtpSetup, setShowOtpSetup] = useState(false)
  const [otpEnabled, setOtpEnabled] = useState(user?.otpEnabled || false)
  const navigate = useNavigate()

  const loadEvents = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchAllEvents()
      setEvents(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      void loadEvents()
    }
  }, [isAuthenticated, user])

  if (!isAuthenticated) {
    return (
      <div className="app">
        <header className="app-header">
          <button type="button" className="link-button" onClick={() => navigate('/')}>
            ← Retour à l&apos;accueil
          </button>
          <h1>Dashboard EventHub</h1>
        </header>
        <main className="app-main">
          <div className="auth-toggle">
            <button
              type="button"
              className={!showRegister ? 'active' : ''}
              onClick={() => setShowRegister(false)}
            >
              Connexion
            </button>
            <button
              type="button"
              className={showRegister ? 'active' : ''}
              onClick={() => setShowRegister(true)}
            >
              Inscription
            </button>
          </div>
          {showRegister ? (
            <RegisterForm onSuccess={loadEvents} />
          ) : (
            <LoginForm onSuccess={loadEvents} />
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <button type="button" className="link-button" onClick={() => navigate('/')}>
          ← Accueil
        </button>
        <div>
          <h1>Dashboard EventHub</h1>
          <p>Vue complète des événements réservée aux utilisateurs authentifiés.</p>
        </div>
        <div className="user-badge">
          <div>
            <strong>{user?.name}</strong>
            <span className="muted">
              {user?.email} • {user?.role}
            </span>
          </div>
          <button type="button" className="secondary-button" onClick={logout}>
            Se déconnecter
          </button>
        </div>
      </header>
      <main className="app-main">
        <section>
          <h2>Paramètres de sécurité</h2>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3>Authentification à deux facteurs (2FA)</h3>
            <p className="muted">
              {otpEnabled
                ? "L'authentification à deux facteurs est activée pour votre compte."
                : "Activez l'authentification à deux facteurs pour renforcer la sécurité de votre compte."}
            </p>
            {showOtpSetup ? (
              <OtpSetup
                onSuccess={() => {
                  setShowOtpSetup(false)
                  setOtpEnabled(true)
                }}
                onCancel={() => setShowOtpSetup(false)}
              />
            ) : (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                {!otpEnabled ? (
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => setShowOtpSetup(true)}
                  >
                    Activer l'OTP
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={async () => {
                        try {
                          await disable()
                          setOtpEnabled(false)
                        } catch (err) {
                          alert(err instanceof Error ? err.message : otpError || 'Erreur lors de la désactivation')
                        }
                      }}
                      disabled={otpLoading}
                    >
                      {otpLoading ? 'Désactivation...' : 'Désactiver l\'OTP'}
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={async () => {
                        try {
                          const codes = await regenerateCodes()
                          alert(`Nouveaux codes de secours générés:\n${codes.join('\n')}\n\nConservez-les en lieu sûr!`)
                        } catch (err) {
                          alert(err instanceof Error ? err.message : otpError || 'Erreur lors de la régénération')
                        }
                      }}
                      disabled={otpLoading}
                    >
                      {otpLoading ? 'Régénération...' : 'Régénérer les codes de secours'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
        <section>
          <h2>Tous les événements</h2>
          {isLoading && <p className="state-message">Chargement des événements...</p>}
          {error && !isLoading && (
            <p className="state-message state-error">Erreur : {error}</p>
          )}
          {!isLoading && !error && events.length === 0 && (
            <p className="state-message">Aucun événement trouvé.</p>
          )}
          {!isLoading && !error && events.length > 0 && (
            <EventList events={events} />
          )}
        </section>
      </main>
    </div>
  )
}


