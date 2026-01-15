"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Calendar, MapPin, Plus } from "lucide-react";
import Image from "next/image";

interface Event {
  id: string;
  title: string;
  date: any;
  location: string;
  imageUrl?: string;
}

export default function EventsListPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const q = query(collection(db, "events"), orderBy("date", "asc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                ...d,
                // Handle Firestore Timestamp or ISO string
                date: d.date?.toDate ? d.date.toDate() : new Date(d.date)
            };
        }) as Event[];
        setEvents(data);
      } catch (e) {
        console.error("Error fetching events:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Upcoming Events</h1>
        <Link href="/events/create" className="p-2 bg-indigo-600 rounded-full text-white shadow-lg shadow-indigo-500/30">
            <Plus size={24} />
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Loading...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
            <Calendar size={48} className="mx-auto mb-4 opacity-20" />
            <p>No upcoming events.</p>
        </div>
      ) : (
        <div className="space-y-4">
            {events.map(event => (
                <Link href={`/events/${event.id}`} key={event.id} className="block group">
                    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-600 transition-all">
                        {event.imageUrl ? (
                            <div className="relative h-40 w-full">
                                <Image
                                    src={event.imageUrl}
                                    alt={event.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80" />
                            </div>
                        ) : (
                            <div className="h-24 bg-gradient-to-r from-indigo-900 to-slate-900" />
                        )}

                        <div className="p-4 -mt-12 relative z-10">
                            <div className="bg-slate-950/50 backdrop-blur-md inline-block px-3 py-1 rounded-lg text-xs font-bold text-indigo-300 mb-2 border border-slate-800">
                                {event.date.toLocaleDateString("en-GB", { weekday: 'short', day: 'numeric', month: 'short' })}
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{event.title}</h2>
                            <div className="flex items-center text-slate-400 text-sm">
                                <MapPin size={14} className="mr-1" />
                                {event.location}
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
      )}
    </div>
  );
}
