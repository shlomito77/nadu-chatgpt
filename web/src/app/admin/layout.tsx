'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, claims, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user || claims?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, claims, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user || claims?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/50 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-400">NADU Admin</h1>
        <div className="text-sm text-slate-400">
          {user.displayName} (Admin)
        </div>
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
