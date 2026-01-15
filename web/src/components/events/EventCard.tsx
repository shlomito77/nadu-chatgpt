'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface Event {
  eventId: string;
  title: string;
  date: any;
  location: string;
  attendeesCount: number;
  maxAttendees: number;
}

export function EventCard({ event }: { event: Event }) {
  const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);

  return (
    <Link href={`/events/event?id=${event.eventId}`}>
      <Card className="border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 transition-colors">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-slate-100">{event.title}</h3>
            <div className="text-center bg-slate-800 px-2 py-1 rounded">
              <span className="block text-xs font-bold text-indigo-400">
                {format(eventDate, 'MMM', { locale: he })}
              </span>
              <span className="block text-lg font-bold text-white leading-none">
                {format(eventDate, 'dd')}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 space-y-2 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span>{format(eventDate, 'EEEE, HH:mm', { locale: he })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />
            <span>{event.attendeesCount} משתתפים {event.maxAttendees > 0 && `/ ${event.maxAttendees}`}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
