'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        טוען...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8 bg-slate-950 text-white font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center text-center">
        <h1 className="text-4xl font-bold">ברוכים הבאים ל-NADU</h1>

        {user ? (
          <div className="space-y-4">
            <p className="text-xl">שלום, {user.displayName || user.email}</p>
            <p className="text-sm text-slate-400">UID: {user.uid}</p>
            <Button onClick={() => signOut()} variant="outline">
              התנתק
            </Button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link href="/login">
              <Button>התחבר</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">הרשם</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
