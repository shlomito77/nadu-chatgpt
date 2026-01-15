'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { EventCard } from '@/components/events/EventCard';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const q = query(
          collection(db, 'events'),
          orderBy('date', 'asc'),
          // In real app, filter where('date', '>=', new Date())
          limit(20)
        );

        const snapshot = await getDocs(q);
        const eventsData = snapshot.docs.map(doc => ({
          ...doc.data(),
          // Handle Timestamp conversion safely
        }));

        setEvents(eventsData);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center p-4 border-b border-slate-800">
        <h1 className="text-xl font-bold">אירועים קרובים</h1>
        <Link href="/events/new">
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 ml-1" />
            אירוע חדש
          </Button>
        </Link>
      </div>

      <div className="space-y-4 px-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : events.length > 0 ? (
          events.map((event) => (
            <EventCard key={event.eventId} event={event} />
          ))
        ) : (
          <div className="text-center py-12 text-slate-500">
            אין אירועים קרובים כרגע.
          </div>
        )}
      </div>
    </div>
  );
}
