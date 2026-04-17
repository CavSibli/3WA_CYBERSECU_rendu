import React, { useEffect, useState } from 'react'
import { fetchPublicEvents } from '../api/client'
import type { Event } from '../types/Event'
import { useNavigate } from 'react-router-dom'
import { EventList } from '../components/EventList'

export const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const load = async () => {
    try {
      const data = await fetchPublicEvents()
      setEvents(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>EventHub</h1>
          <p>Découvrez les prochains événements, et connectez-vous pour tout voir.</p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => navigate('/dashboard')}
        >
          Se connecter pour tout voir
        </button>
      </header>
      <main className="app-main">
        <section>
          <h2>À la une</h2>
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


