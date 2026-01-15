'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronRight, Calendar } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxAttendees, setMaxAttendees] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const functions = getFunctions();
      const createEvent = httpsCallable(functions, 'createEvent');

      const dateTime = new Date(`${date}T${time}`).toISOString();

      await createEvent({
        title,
        description,
        date: dateTime,
        location,
        maxAttendees: Number(maxAttendees)
      });

      router.push('/events');
    } catch (err) {
      console.error('Error creating event:', err);
      alert('שגיאה ביצירת האירוע');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-4">
      <div className="flex items-center gap-2 py-4 border-b border-slate-800">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronRight className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">יצירת אירוע</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="שם האירוע"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          required
          minLength={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="תאריך"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
            required
            className="text-right"
          />
          <Input
            label="שעה"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={loading}
            required
            className="text-right"
          />
        </div>

        <Input
          label="מיקום"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={loading}
          required
          placeholder="תל אביב / קישור לזום"
        />

        <Input
          label="מקסימום משתתפים (0 = ללא הגבלה)"
          type="number"
          value={maxAttendees}
          onChange={(e) => setMaxAttendees(Number(e.target.value))}
          disabled={loading}
          min={0}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">תיאור</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            required
            className="flex min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="פרטים נוספים..."
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          צור אירוע
        </Button>
      </form>
    </div>
  );
}
