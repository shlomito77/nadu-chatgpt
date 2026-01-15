'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

export function CreatePostButton() {
  return (
    <Link href="/post/new">
      <button className="fixed bottom-20 left-4 h-14 w-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40">
        <Plus className="h-8 w-8" />
      </button>
    </Link>
  );
}
