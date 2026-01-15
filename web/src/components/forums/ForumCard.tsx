'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MessageSquare, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

interface Forum {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  stats: {
    posts: number;
    members: number;
  };
}

// Static definition of forums for MVP (instead of fetching from DB)
export const FORUMS: Forum[] = [
  {
    id: 'general',
    title: 'BDSM כללי',
    description: 'דיונים כלליים על אורח החיים, שאלות ותשובות.',
    icon: '🌍',
    color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    stats: { posts: 120, members: 450 }
  },
  {
    id: 'dom_sub',
    title: 'שליטה וכניעה',
    description: 'המרחב לדיונים על יחסי כוח, D/s ומה שביניהם.',
    icon: '👑',
    color: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    stats: { posts: 85, members: 320 }
  },
  {
    id: 'impact',
    title: 'אימפקט',
    description: 'ספנקים, הצלפות, וכל מה שמשאיר סימן.',
    icon: '💥',
    color: 'bg-red-500/10 border-red-500/20 text-red-400',
    stats: { posts: 45, members: 150 }
  },
  {
    id: 'ropes',
    title: 'קשירות (Shibari)',
    description: 'אמנות הקשירה, בטיחות, ופרקטיקה.',
    icon: '🪢',
    color: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    stats: { posts: 60, members: 200 }
  },
  {
    id: 'dating',
    title: 'היכרויות',
    description: 'לוח היכרויות לחברי הקהילה.',
    icon: '💘',
    color: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
    stats: { posts: 200, members: 800 }
  },
  {
    id: 'off_topic',
    title: 'אוף טופיק',
    description: 'על כל מה שלא קשור בדס"מ.',
    icon: '☕',
    color: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
    stats: { posts: 300, members: 500 }
  }
];

export function ForumCard({ forum }: { forum: Forum }) {
  return (
    <Link href={`/forums/forum?id=${forum.id}`}>
      <Card className={cn("h-full transition-all hover:bg-slate-800/50 border", forum.color.replace('text-', 'border-'))}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <span className="text-3xl">{forum.icon}</span>
          <div className="flex gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> {forum.stats.posts}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {forum.stats.members}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className={cn("font-bold text-lg mb-1", forum.color.split(' ')[2])}>{forum.title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
            {forum.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
