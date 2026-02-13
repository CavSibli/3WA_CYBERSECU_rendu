import React from 'react'
import type { Event } from '../types/Event'

interface Props {
  events: Event[]
}

export const EventList: React.FC<Props> = ({ events }) => {
  if (events.length === 0) {
    return <p className="state-message">Aucun événement trouvé.</p>
  }

  return (
    <div className="event-list">
      {events.map((event) => (
        <article key={event.id} className="event-card">
          <h2>{event.title}</h2>
          <p className="event-description">{event.description}</p>
          <p className="event-dates">
            Du {new Date(event.startDate).toLocaleString()} au{' '}
            {event.endDate ? new Date(event.endDate).toLocaleString() : 'N/A'}
          </p>
          <p className="event-meta">
            Capacité : {event.capacity} • Prix : {event.price ?? 0} €
          </p>
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="event-image"
            />
          )}
        </article>
      ))}
    </div>
  )
}
