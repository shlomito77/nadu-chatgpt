import Link from "next/link";
import { Bell } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50 flex items-center justify-between px-4 max-w-md mx-auto w-full">
      <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        NADU
      </Link>
      <button className="p-2 text-slate-400 hover:text-white transition-colors">
        <Bell className="w-5 h-5" />
      </button>
    </header>
  );
}
