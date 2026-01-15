'use client';

import { Post } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { User, MessageCircle, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface PostCardProps {
  post: Post & {
    authorDisplayName?: string;
    authorPhotoURL?: string;
    stats?: { likes: number; comments: number };
  };
}

export function PostCard({ post }: PostCardProps) {
  // Logic for anonymous display
  const displayName = post.isAnonymous ? 'אנונימי' : post.authorDisplayName;
  const photoURL = post.isAnonymous ? null : post.authorPhotoURL;

  return (
    <Card className="border-slate-800 bg-slate-900/50 mb-4">
      <CardHeader className="flex-row gap-3 space-y-0 p-4">
        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
          {photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoURL} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <User className="h-6 w-6 text-slate-500" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-200">{displayName}</span>
          <span className="text-xs text-slate-500">
            {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: he }) : 'עכשיו'}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-2">
        <h3 className="text-lg font-bold text-slate-100">{post.title}</h3>
        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>
      </CardContent>

      <CardFooter className="p-2 border-t border-slate-800 flex justify-between">
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-indigo-400">
          <Heart className="h-4 w-4 ml-1" />
          {post.stats?.likes || 0}
        </Button>
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-indigo-400">
          <MessageCircle className="h-4 w-4 ml-1" />
          {post.stats?.comments || 0}
        </Button>
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-indigo-400">
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
