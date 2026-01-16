'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, where } from 'firebase/firestore';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/cn';

interface Notification {
  id: string;
  title: string;
  body: string;
  link: string;
  isRead: boolean;
  createdAt: any;
}

export function NotificationsMenu() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];

      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    });

    return () => unsubscribe();
  }, [user]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const markAsRead = async (notification: Notification) => {
    if (notification.isRead || !user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'notifications', notification.id), {
        isRead: true
      });
    } catch (err) {
      console.error('Error marking as read', err);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        className="text-slate-400 relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-950 animate-pulse" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 origin-top-left">
          <div className="p-3 border-b border-slate-800 font-bold text-sm text-slate-300">
            התראות
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                אין התראות חדשות
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.link}
                  onClick={() => {
                    markAsRead(notif);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "block p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors text-right",
                    !notif.isRead && "bg-slate-800/30"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    {!notif.isRead && <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5" />}
                    <span className="text-xs text-slate-500">
                      {notif.createdAt?.toDate ? formatDistanceToNow(notif.createdAt.toDate(), { locale: he }) : ''}
                    </span>
                  </div>
                  <h4 className={cn("text-sm font-semibold", !notif.isRead ? "text-white" : "text-slate-300")}>
                    {notif.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {notif.body}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
