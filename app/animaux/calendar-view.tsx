"use client"

import { useState, useCallback } from 'react'
import { Calendar, momentLocalizer, Event, View } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/fr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

moment.locale('fr')
const localizer = momentLocalizer(moment)

interface GardeAnimaux {
  id: string
  typeAnimal: string
  nomAnimal: string
  nomClient: string
  dateDebut: string
  dateFin: string
  tarif: number
  statut: string
}

interface CalendarViewProps {
  gardes: GardeAnimaux[]
}

export function CalendarView({ gardes }: CalendarViewProps) {
  const [date, setDate] = useState(new Date())
  const [view, setView] = useState<View>('month')

  const onNavigate = useCallback((newDate: Date) => setDate(newDate), [])
  const onView = useCallback((newView: View) => setView(newView), [])
  // Transformer les gardes en événements pour le calendrier
  const events: Event[] = gardes.map((garde) => ({
    title: `${garde.typeAnimal} ${garde.nomAnimal} - ${garde.nomClient}`,
    start: new Date(garde.dateDebut),
    end: new Date(garde.dateFin),
    resource: garde,
  }))

  // Style des événements selon le statut
  const eventStyleGetter = (event: Event) => {
    const garde = event.resource as GardeAnimaux
    let backgroundColor = '#3b82f6' // bleu par défaut

    if (garde.statut === 'terminé') {
      backgroundColor = '#10b981' // vert
    } else if (garde.statut === 'en_cours') {
      backgroundColor = '#f59e0b' // orange
    } else if (garde.statut === 'annulé') {
      backgroundColor = '#ef4444' // rouge
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    }
  }

  const messages = {
    allDay: 'Journée',
    previous: 'Précédent',
    next: 'Suivant',
    today: "Aujourd'hui",
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Événement',
    noEventsInRange: 'Aucune garde dans cette période',
    showMore: (total: number) => `+ ${total} autre(s)`,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendrier des gardes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            messages={messages}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day', 'agenda']}
            view={view}
            date={date}
            onNavigate={onNavigate}
            onView={onView}
            popup
            style={{ height: '100%' }}
          />
        </div>
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span>Confirmé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500"></div>
            <span>En cours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span>Terminé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span>Annulé</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
