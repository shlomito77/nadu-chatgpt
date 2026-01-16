"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { ReportButton } from "./ReportButton";

interface PostCardProps {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  imageURL?: string;
  createdAt: Timestamp | Date | number; // Handle different formats
  likes: number;
  commentsCount: number;
}

export function PostCard({
  id,
  content,
  authorId,
  authorName,
  authorPhotoURL,
  imageURL,
  createdAt,
  likes,
  commentsCount,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false); // Placeholder for actual like logic

  let dateDisplay = "";
  if (createdAt) {
      const date = createdAt instanceof Timestamp ? createdAt.toDate() : new Date(createdAt);
      dateDisplay = formatDistanceToNow(date, { addSuffix: true });
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden relative">
            {authorPhotoURL ? (
              <Image
                src={authorPhotoURL}
                alt={authorName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                {authorName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">{authorName}</h3>
            <p className="text-xs text-slate-400">{dateDisplay}</p>
          </div>
        </div>
        <ReportButton targetId={id} targetType="post" />
      </div>

      <p className="text-slate-200 mb-4 whitespace-pre-wrap">{content}</p>

      {imageURL && (
        <div className="mb-4 relative w-full h-64 rounded-md overflow-hidden bg-slate-800">
           <Image
             src={imageURL}
             alt="Post content"
             fill
             className="object-cover"
           />
        </div>
      )}

      <div className="flex items-center justify-between text-slate-400 text-sm border-t border-slate-800 pt-3">
        <button
          className={`flex items-center gap-2 hover:text-red-400 transition-colors ${isLiked ? "text-red-500" : ""}`}
          onClick={() => setIsLiked(!isLiked)}
        >
          <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          <span>{likes + (isLiked ? 1 : 0)}</span>
        </button>

        <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span>{commentsCount}</span>
        </button>

        <button className="flex items-center gap-2 hover:text-green-400 transition-colors">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
