"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/BottomNav";
import { Avatar } from "@/components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { getDoc, doc } from "firebase/firestore";

interface ChatDoc {
  id: string;
  participants: string[];
  lastMessage?: {
    content: string;
    senderUid: string;
    sentAt: any;
  };
  updatedAt: any;
  // Denormalized partner data for display
  partner?: {
    uid: string;
    displayName: string;
    photoURL?: string;
  };
}

export default function ChatListPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Listen to chats where user is a participant
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ChatDoc));

      // Fetch partner details for each chat
      // Optimization: In a real app, denormalize partner info on the chat doc or use a users cache context
      const enrichedChats = await Promise.all(chatDocs.map(async (chat) => {
        const partnerUid = chat.participants.find(p => p !== user.uid);
        if (!partnerUid) return chat;

        try {
          const userSnap = await getDoc(doc(db, "users", partnerUid));
          if (userSnap.exists()) {
             const userData = userSnap.data();
             return {
               ...chat,
               partner: {
                 uid: partnerUid,
                 displayName: userData.displayName,
                 photoURL: userData.photoURL
               }
             };
          }
        } catch (e) {
          console.error("Error fetching partner", e);
        }
        return chat;
      }));

      setChats(enrichedChats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-white">Loading chats...</div>;

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-md mx-auto p-4 pt-6">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>

        <div className="space-y-2">
          {chats.length === 0 && <p className="text-gray-500 text-center">No messages yet.</p>}

          {chats.map((chat) => (
            <Link key={chat.id} href={`/chat/${chat.id}`} className="block">
              <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-900 transition-colors">
                <Avatar
                  src={chat.partner?.photoURL}
                  fallback={chat.partner?.displayName?.charAt(0) || "?"}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold truncate">{chat.partner?.displayName || "Unknown User"}</span>
                    {chat.lastMessage && (
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatDistanceToNow(chat.lastMessage.sentAt?.toDate ? chat.lastMessage.sentAt.toDate() : new Date(), { addSuffix: false })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {chat.lastMessage ? (
                      <>
                        {chat.lastMessage.senderUid === user?.uid && "You: "}
                        {chat.lastMessage.content}
                      </>
                    ) : (
                      <span className="italic">No messages yet</span>
                    )}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
