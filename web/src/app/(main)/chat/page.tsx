import { ChatList } from '@/components/chat/ChatList';

export default function ChatLobbyPage() {
  return (
    <div className="min-h-full">
      <h1 className="text-xl font-bold p-4 border-b border-slate-800">הודעות</h1>
      <ChatList />
    </div>
  );
}
