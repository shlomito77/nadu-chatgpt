"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare, Search } from "lucide-react";
import Link from "next/link";

interface Chat {
  id: string;
  type: "dm" | "group";
  memberUids: string[];
  updatedAt?: any;
  lastMessageText?: string;
  // title? for groups
}

export default function ChatListPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChats() {
        if (!user) return;
        try {
            const q = query(
                collection(db, "chats"),
                where("memberUids", "array-contains", user.uid),
                orderBy("updatedAt", "desc")
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Chat[];
            setChats(data);
        } catch (e) {
            console.error("Error fetching chats:", e);
        } finally {
            setLoading(false);
        }
    }
    fetchChats();
  }, [user]);

  if (!user) return <div className="text-center mt-20">Please log in.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Messages</h1>
        <button className="p-2 bg-slate-900 rounded-full border border-slate-800">
            <Search size={20} className="text-slate-400" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Loading chats...</div>
      ) : chats.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
            <p>No messages yet.</p>
            <p className="text-xs mt-2">Start a conversation from a profile!</p>
        </div>
      ) : (
        <div className="space-y-2">
            {chats.map(chat => (
                <Link href={`/chat/${chat.id}`} key={chat.id} className="block bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="font-bold">
                            {chat.type === "dm" ? "Direct Message" : "Group Chat"}
                        </div>
                        <div className="text-xs text-slate-500">
                            Now
                        </div>
                    </div>
                    <div className="text-sm text-slate-400 mt-1 truncate">
                        {chat.lastMessageText || "No messages yet"}
                    </div>
                </Link>
            ))}
        </div>
      )}
    </div>
  );
}
