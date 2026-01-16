"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { db, functions } from "@/lib/firebase";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/Skeleton";
import { Calendar, MapPin, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Timestamp;
  location: string;
  imageURL?: string;
  goingCount: number;
}

export default function EventDetailPage() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [userStatus, setUserStatus] = useState<"going" | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const docRef = doc(db, "events", eventId as string);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setEvent({ id: docSnap.id, ...docSnap.data() } as Event);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching event:", error);
      toast.error("Failed to load event");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventId]);

  const handleRSVP = async (status: "going" | "not_going") => {
    if (!user) {
        toast.error("Please sign in to RSVP");
        return;
    }
    setRsvpLoading(true);
    try {
        const rsvpFn = httpsCallable(functions, 'rsvpEvent');
        await rsvpFn({ eventId, status });
        toast.success(status === 'going' ? "You are going!" : "Updated RSVP");
        setUserStatus(status === 'going' ? 'going' : null);
    } catch (error) {
        console.error("RSVP failed", error);
        toast.error("Failed to RSVP");
    } finally {
        setRsvpLoading(false);
    }
  };

  if (loading) {
      return (
          <div className="space-y-4 pt-4">
              <Skeleton className="w-full h-64 rounded-lg" />
              <Skeleton className="w-3/4 h-8" />
              <Skeleton className="w-1/2 h-4" />
          </div>
      );
  }

  if (!event) {
      return <div className="pt-10 text-center text-slate-500">Event not found.</div>;
  }

  let dateDisplay = "";
  if (event.startDate) {
      const date = event.startDate instanceof Timestamp ? event.startDate.toDate() : new Date(event.startDate);
      dateDisplay = format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");
  }

  return (
    <div className="pb-20">
       <div className="relative h-64 md:h-80 bg-slate-800 -mx-4 w-[calc(100%+2rem)] mb-6">
          {event.imageURL && (
              <Image
                src={event.imageURL}
                alt={event.title}
                fill
                className="object-cover"
              />
          )}
          <Link href="/events" className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-10">
              <ArrowLeft className="w-6 h-6" />
          </Link>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60" />
       </div>

       <div className="px-2 space-y-6">
           <div>
               <h1 className="text-3xl font-bold text-slate-100 mb-2">{event.title}</h1>
               <div className="flex flex-col gap-2 text-slate-400">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <span>{dateDisplay}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-red-400" />
                        <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-400" />
                        <span>{event.goingCount || 0} going</span>
                    </div>
               </div>
           </div>

           <div className="prose prose-invert prose-slate max-w-none">
               <p className="whitespace-pre-wrap text-slate-300">{event.description}</p>
           </div>

           <div className="fixed bottom-20 left-0 right-0 px-4 max-w-md mx-auto z-20">
               <button
                  onClick={() => handleRSVP('going')}
                  disabled={rsvpLoading || userStatus === 'going'}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
               >
                   {rsvpLoading ? "Updating..." : userStatus === 'going' ? "You are Going" : "RSVP Now"}
               </button>
           </div>
       </div>
    </div>
  );
}
