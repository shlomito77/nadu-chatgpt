"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { Calendar, MapPin, ArrowLeft, Clock, Check, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Event {
  id: string;
  title: string;
  date: any;
  location: string;
  description: string;
  imageUrl?: string;
  organizerName: string;
}

export default function EventDetailsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvp, setRsvp] = useState<"going" | null>(null);
  const [attendeesCount, setAttendeesCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
        if (!eventId) return;
        try {
            // Fetch Event
            const docRef = doc(db, "events", eventId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const d = docSnap.data();
                setEvent({
                    id: docSnap.id,
                    ...d,
                    date: d.date?.toDate ? d.date.toDate() : new Date(d.date)
                } as Event);
            } else {
                router.push("/events"); // Redirect if not found
            }

            // Fetch RSVP status
            if (user) {
                const rsvpRef = doc(db, "events", eventId, "rsvps", user.uid);
                const rsvpSnap = await getDoc(rsvpRef);
                if (rsvpSnap.exists()) {
                    setRsvp("going");
                }
            }

            // Fetch Attendees Count (naive count for MVP)
            const rsvpColl = collection(db, "events", eventId, "rsvps");
            const rsvpSnaps = await getDocs(rsvpColl);
            setAttendeesCount(rsvpSnaps.size);

        } catch (e) {
            console.error("Error fetching event details:", e);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [eventId, user, router]);

  const toggleRsvp = async () => {
    if (!user) {
        alert("Please log in to RSVP.");
        return;
    }

    const rsvpRef = doc(db, "events", eventId, "rsvps", user.uid);

    try {
        if (rsvp === "going") {
            await deleteDoc(rsvpRef);
            setRsvp(null);
            setAttendeesCount(prev => Math.max(0, prev - 1));
        } else {
            await setDoc(rsvpRef, {
                uid: user.uid,
                name: user.displayName,
                joinedAt: new Date()
            });
            setRsvp("going");
            setAttendeesCount(prev => prev + 1);
        }
    } catch (e) {
        console.error("RSVP failed:", e);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading...</div>;
  if (!event) return null;

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Hero Image */}
      <div className="relative h-64 -mx-4 -mt-16">
        {event.imageUrl ? (
            <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
        ) : (
            <div className="w-full h-full bg-slate-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        <Link href="/events" className="absolute top-20 left-4 p-2 bg-slate-900/50 backdrop-blur rounded-full text-white">
            <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="space-y-6 -mt-10 relative z-10 px-2">
        <div>
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <div className="flex flex-col space-y-2 text-slate-300 text-sm">
                <div className="flex items-center">
                    <Calendar size={16} className="mr-2 text-indigo-400" />
                    {event.date.toLocaleDateString("en-GB", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="flex items-center">
                    <Clock size={16} className="mr-2 text-indigo-400" />
                    {event.date.toLocaleTimeString("en-GB", { hour: '2-digit', minute:'2-digit' })}
                </div>
                <div className="flex items-center">
                    <MapPin size={16} className="mr-2 text-indigo-400" />
                    {event.location}
                </div>
            </div>
        </div>

        {/* RSVP Action */}
        <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div>
                <div className="text-lg font-bold">{attendeesCount} Going</div>
                <div className="text-xs text-slate-500">Organized by {event.organizerName}</div>
            </div>
            <button
                onClick={toggleRsvp}
                className={`px-6 py-3 rounded-xl font-bold flex items-center transition-all ${
                    rsvp === "going"
                    ? "bg-slate-800 text-green-400 border border-green-900"
                    : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                }`}
            >
                {rsvp === "going" ? (
                    <>
                        <Check size={18} className="mr-2" />
                        Going
                    </>
                ) : (
                    "Join Event"
                )}
            </button>
        </div>

        {/* Description */}
        <div className="space-y-2">
            <h2 className="font-bold text-lg">About</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {event.description}
            </p>
        </div>
      </div>
    </div>
  );
}
