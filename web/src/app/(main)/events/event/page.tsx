'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar, MapPin, Users, Loader2, Check, HelpCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '@/lib/contexts/AuthContext';
import { cn } from '@/lib/cn';

function EventDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id');
  const { user } = useAuth();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [myRsvp, setMyRsvp] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    async function fetchEvent() {
      try {
        // Fetch Event
        const docRef = doc(db, 'events', eventId!);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEvent({ eventId: docSnap.id, ...docSnap.data() });

          // Fetch My RSVP
          if (user) {
            const rsvpRef = doc(db, 'events', eventId!, 'rsvps', user.uid);
            const rsvpSnap = await getDoc(rsvpRef);
            if (rsvpSnap.exists()) {
              setMyRsvp(rsvpSnap.data().status);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [eventId, user]);

  const handleRsvp = async (status: 'going' | 'maybe' | 'not_going') => {
    if (!user) return router.push('/login');
    setRsvpLoading(true);

    try {
      const functions = getFunctions();
      const rsvpEvent = httpsCallable(functions, 'rsvpEvent');
      await rsvpEvent({ eventId, status });
      setMyRsvp(status);

      // Optimistic update of count (simplified)
      if (event) {
        setEvent((prev: any) => ({
          ...prev,
          attendeesCount: status === 'going' && myRsvp !== 'going'
            ? prev.attendeesCount + 1
            : status !== 'going' && myRsvp === 'going'
              ? prev.attendeesCount - 1
              : prev.attendeesCount
        }));
      }
    } catch (err) {
      console.error('Error RSVP:', err);
      alert('שגיאה בעדכון הגעה');
    } finally {
      setRsvpLoading(false);
    }
  };

  if (!eventId) return null;
  if (loading) return <div className="p-8 text-center">טוען אירוע...</div>;
  if (!event) return <div className="p-8 text-center">אירוע לא נמצא</div>;

  const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);

  return (
    <div className="pb-24">
      {/* Header Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-indigo-900 to-slate-900 relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      <div className="px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
          <div className="flex flex-col gap-2 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(eventDate, 'EEEE, d בMMMM yyyy, HH:mm', { locale: he })}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{event.attendeesCount} משתתפים {event.maxAttendees > 0 && `/ ${event.maxAttendees}`}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <h2 className="font-bold mb-2 text-slate-200">תיאור</h2>
          <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* RSVP Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950 border-t border-slate-800 flex gap-2 justify-center z-50">
          <Button
            variant={myRsvp === 'going' ? 'primary' : 'outline'}
            onClick={() => handleRsvp('going')}
            disabled={rsvpLoading}
            className={cn("flex-1", myRsvp === 'going' && "bg-green-600 hover:bg-green-700")}
          >
            <Check className="h-4 w-4 ml-2" />
            מגיע
          </Button>

          <Button
            variant={myRsvp === 'maybe' ? 'primary' : 'outline'}
            onClick={() => handleRsvp('maybe')}
            disabled={rsvpLoading}
            className="flex-1"
          >
            <HelpCircle className="h-4 w-4 ml-2" />
            אולי
          </Button>

          <Button
            variant={myRsvp === 'not_going' ? 'primary' : 'outline'}
            onClick={() => handleRsvp('not_going')}
            disabled={rsvpLoading}
            className={cn("flex-1", myRsvp === 'not_going' && "bg-slate-700")}
          >
            <X className="h-4 w-4 ml-2" />
            לא
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function EventPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">טוען...</div>}>
      <EventDetailsContent />
    </Suspense>
  );
}
