'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, User, Users, Menu } from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  {
    label: 'פיד',
    icon: Home,
    href: '/',
  },
  {
    label: 'פורומים',
    icon: Users,
    href: '/forums',
  },
  {
    label: 'צ\'אט',
    icon: MessageCircle,
    href: '/chat',
  },
  {
    label: 'פרופיל',
    icon: User,
    href: '/profile',
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60 pb-safe-area-bottom">
      <div className="flex h-16 items-center justify-around px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-[64px] rounded-lg p-1 transition-colors',
                isActive
                  ? 'text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Icon className={cn("h-6 w-6", isActive && "fill-current/20")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
