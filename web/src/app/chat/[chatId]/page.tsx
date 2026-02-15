"use client";

import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/BottomNav";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface MessageDoc {
  id: string;
  senderUid: string;
  content: string;
  type: 'text' | 'image';
  createdAt: any;
}

interface ChatDoc {
  participants: string[];
}

export default function ChatRoomPage() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [partner, setPartner] = useState<{ displayName: string; photoURL?: string } | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId || !user) return;

    // 1. Fetch Chat Metadata (to find partner)
    const fetchChatData = async () => {
      try {
        const chatSnap = await getDoc(doc(db, "chats", chatId as string));
        if (chatSnap.exists()) {
          const chatData = chatSnap.data() as ChatDoc;
          const partnerUid = chatData.participants.find(p => p !== user.uid);
          if (partnerUid) {
            const userSnap = await getDoc(doc(db, "users", partnerUid));
            if (userSnap.exists()) {
              const userData = userSnap.data();
              setPartner({
                displayName: userData.displayName,
                photoURL: userData.photoURL
              });
            }
          }
        }
      } catch (e) {
        console.error("Error fetching chat info", e);
      }
    };
    fetchChatData();

    // 2. Listen for Messages
    const q = query(
      collection(db, "chats", chatId as string, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MessageDoc));
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [chatId, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const sendMessage = httpsCallable(functions, "sendMessage");
      await sendMessage({
        chatId: chatId,
        content: newMessage,
        type: 'text'
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
      alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white pb-safe">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-3 sticky top-0 bg-black/80 backdrop-blur z-10">
        <Avatar src={partner?.photoURL} fallback={partner?.displayName?.charAt(0) || "?"} size="sm" />
        <span className="font-bold">{partner?.displayName || "Loading..."}</span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderUid === user?.uid;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  isMe ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-200"
                }`}
              >
                <p>{msg.content}</p>
                <span className={`text-[10px] opacity-70 block text-right mt-1 ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                  {msg.createdAt?.toDate ? formatDistanceToNow(msg.createdAt.toDate(), { addSuffix: true }) : "Sending..."}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800 bg-black sticky bottom-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !newMessage.trim()}>
            Send
          </Button>
        </form>
      </div>

      {/* Spacer for safe area if needed, but flex-col h-screen handles most */}
    </div>
  );
}
