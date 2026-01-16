"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { Calendar, MapPin, Users } from "lucide-react";

interface EventCardProps {
  id: string;
  title: string;
  startDate: Timestamp | Date | number;
  location: string;
  imageURL?: string;
  goingCount: number;
}

export function EventCard({
  id,
  title,
  startDate,
  location,
  imageURL,
  goingCount,
}: EventCardProps) {
  let dateDisplay = "";
  if (startDate) {
      const date = startDate instanceof Timestamp ? startDate.toDate() : new Date(startDate);
      dateDisplay = format(date, "MMM d, h:mm a");
  }

  return (
    <Link href={`/events/${id}`} className="block bg-slate-900 border border-slate-800 rounded-lg overflow-hidden mb-4 hover:border-slate-700 transition-colors group">
      {imageURL && (
        <div className="relative w-full h-48 bg-slate-800">
           <Image
             src={imageURL}
             alt={title}
             fill
             className="object-cover group-hover:scale-105 transition-transform duration-500"
           />
        </div>
      )}

      <div className="p-4">
        <h3 className="font-bold text-lg text-slate-100 mb-2 group-hover:text-blue-400 transition-colors">{title}</h3>

        <div className="space-y-2 text-sm text-slate-400">
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{dateDisplay}</span>
            </div>
            <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>{location}</span>
            </div>
             <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span>{goingCount} going</span>
            </div>
        </div>
      </div>
    </Link>
  );
}
