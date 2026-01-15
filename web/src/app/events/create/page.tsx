"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, AlignLeft, Clock } from "lucide-react";
import ImageUploader from "@/components/ui/ImageUploader";

export default function CreateEventPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !date || !location) return;

    setLoading(true);
    try {
      // Create date object
      const dateTime = new Date(`${date}T${time || "00:00"}`);

      await addDoc(collection(db, "events"), {
        title,
        date: dateTime,
        location,
        description,
        imageUrl,
        organizerId: user.uid,
        organizerName: user.displayName || "Anonymous",
        createdAt: serverTimestamp(),
        attendeesCount: 0
      });
      router.push("/events");
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-4 text-center">Please log in.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Event</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Flyer Upload */}
        <div className="h-48 w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
            <ImageUploader
                onUpload={setImageUrl}
                pathPrefix={`events/${user.uid}`}
                currentImage={imageUrl}
                className="w-full h-full"
            />
        </div>

        {/* Inputs */}
        <div className="space-y-4">
            <div>
                <label className="block text-xs text-slate-400 mb-1 ml-1">Event Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none"
                    placeholder="e.g. Dungeon Party"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-slate-400 mb-1 ml-1">Date</label>
                    <div className="relative">
                        <Calendar size={18} className="absolute left-3 top-3.5 text-slate-500" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 focus:border-indigo-500 outline-none appearance-none"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1 ml-1">Time</label>
                    <div className="relative">
                        <Clock size={18} className="absolute left-3 top-3.5 text-slate-500" />
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 focus:border-indigo-500 outline-none appearance-none"
                            required
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs text-slate-400 mb-1 ml-1">Location</label>
                <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-3.5 text-slate-500" />
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 focus:border-indigo-500 outline-none"
                        placeholder="e.g. Tel Aviv / Secret Location"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs text-slate-400 mb-1 ml-1">Description</label>
                <div className="relative">
                    <AlignLeft size={18} className="absolute left-3 top-3.5 text-slate-500" />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 focus:border-indigo-500 outline-none h-32 resize-none"
                        placeholder="Details about the event..."
                    />
                </div>
            </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}
