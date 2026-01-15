import { Heart, MessageCircle, Share2 } from "lucide-react";
import Image from "next/image";

interface PostProps {
  id: string;
  authorName: string;
  text: string;
  imageUrl?: string;
  createdAt: any;
  likes?: number;
}

export default function PostCard({ authorName, text, imageUrl, likes = 0 }: PostProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-lg font-bold">
          {authorName[0]}
        </div>
        <div>
          <div className="font-bold text-sm">{authorName}</div>
          <div className="text-xs text-slate-500">2h ago</div>
        </div>
      </div>

      {text && <p className="text-sm leading-relaxed text-slate-200">{text}</p>}

      {imageUrl && (
        <div className="relative w-full h-64 rounded-xl overflow-hidden bg-slate-950">
            <Image
                src={imageUrl}
                alt="Post content"
                fill
                className="object-cover"
            />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-6 text-slate-400 pt-2">
        <button className="flex items-center space-x-1 hover:text-pink-500">
          <Heart size={18} />
          <span className="text-xs">{likes}</span>
        </button>
        <button className="flex items-center space-x-1 hover:text-indigo-500">
          <MessageCircle size={18} />
          <span className="text-xs">Comment</span>
        </button>
        <button className="flex items-center space-x-1 hover:text-slate-200">
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
}
