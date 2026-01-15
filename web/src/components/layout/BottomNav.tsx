import Link from 'next/link';
import { Home, User, MessageSquare, PlusSquare } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-safe">
      <div className="flex justify-around items-center h-16">
        <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-indigo-500">
          <Home size={24} />
          <span className="text-xs mt-1">Feed</span>
        </Link>
        <Link href="/create" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-indigo-500">
          <PlusSquare size={24} />
          <span className="text-xs mt-1">Post</span>
        </Link>
        <Link href="/chat" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-indigo-500">
          <MessageSquare size={24} />
          <span className="text-xs mt-1">Chat</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-indigo-500">
          <User size={24} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
