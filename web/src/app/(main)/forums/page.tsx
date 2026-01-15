'use client';

import { FORUMS, ForumCard } from '@/components/forums/ForumCard';

export default function ForumsPage() {
  return (
    <div className="space-y-6 pb-20 px-4">
      <div className="py-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold">פורומים</h1>
        <p className="text-slate-400 text-sm">בחר את הקהילה שמעניינת אותך</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FORUMS.map((forum) => (
          <ForumCard key={forum.id} forum={forum} />
        ))}
      </div>
    </div>
  );
}
