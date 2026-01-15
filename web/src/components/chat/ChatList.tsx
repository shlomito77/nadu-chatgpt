'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/lib/contexts/AuthContext';
import { User, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface ChatPreview {
  chatId: string;
  type: 'dm' | 'group' | 'lobby';
  participants: string[];
  lastMessage?: {
    text: string;
    timestamp: any;
  };
  updatedAt: any;
}

export function ChatList() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Listen to chats where user is participant
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        chatId: doc.id,
        ...doc.data()
      })) as ChatPreview[];

      setChats(chatsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <div className="text-center p-4 text-slate-500">טוען שיחות...</div>;
  }

  if (chats.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500 flex flex-col items-center gap-2">
        <MessageCircle className="h-12 w-12 opacity-50" />
        <p>אין שיחות פעילות</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {chats.map((chat) => (
        <Link
          key={chat.chatId}
          href={`/chat/room?id=${chat.chatId}`}
          className="flex items-center gap-3 p-4 bg-slate-900/50 border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
        >
          <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <User className="h-6 w-6 text-slate-500" />
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-slate-200">
                {chat.type === 'dm' ? 'שיחה פרטית' : 'קבוצה'}
              </span>
              {chat.lastMessage?.timestamp && (
                <span className="text-xs text-slate-500">
                  {formatDistanceToNow(chat.lastMessage.timestamp.toDate(), { addSuffix: false, locale: he })}
                </span>
              )}
            </div>

            <p className="text-sm text-slate-400 truncate">
              {chat.lastMessage?.text || 'אין הודעות'}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
