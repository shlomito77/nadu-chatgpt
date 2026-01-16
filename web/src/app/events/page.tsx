"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { EventCard } from "@/components/ui/EventCard";
import { Skeleton } from "@/components/ui/Skeleton";

interface Event {
  id: string;
  title: string;
  startDate: Timestamp;
  location: string;
  imageURL?: string;
  goingCount: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("startDate", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newEvents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];
      setEvents(newEvents);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching events:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6 pt-6">
      <h1 className="text-2xl font-bold text-slate-100 px-2">Upcoming Events</h1>

      <div className="space-y-4">
        {loading ? (
           Array.from({ length: 3 }).map((_, i) => (
             <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden h-64 animate-pulse">
                <div className="h-48 bg-slate-800" />
                <div className="p-4 space-y-2">
                    <Skeleton className="w-1/2 h-5" />
                    <Skeleton className="w-1/3 h-4" />
                </div>
             </div>
           ))
        ) : events.length > 0 ? (
          events.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              startDate={event.startDate}
              location={event.location}
              imageURL={event.imageURL}
              goingCount={event.goingCount || 0}
            />
          ))
        ) : (
          <div className="text-center py-10 text-slate-500">
            No upcoming events.
          </div>
        )}
      </div>
    </div>
  );
}
