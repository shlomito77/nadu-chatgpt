'use client';

import { ChatRoom } from '@/components/chat/ChatRoom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ChatRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('id');

  if (!chatId) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 border-b border-slate-800 bg-slate-950/50 backdrop-blur sticky top-14 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronRight className="h-6 w-6" />
        </Button>
        <span className="font-semibold">צ'אט</span>
      </div>

      <ChatRoom chatId={chatId} />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">טוען צ'אט...</div>}>
      <ChatRoomContent />
    </Suspense>
  );
}
