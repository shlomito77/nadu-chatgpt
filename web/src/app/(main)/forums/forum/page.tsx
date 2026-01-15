'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { Post } from '@/types';
import { PostCard } from '@/components/feed/PostCard';
import { CreatePostButton } from '@/components/feed/CreatePostButton';
import { Button } from '@/components/ui/button';
import { ChevronRight, Loader2 } from 'lucide-react';
import { FORUMS } from '@/components/forums/ForumCard';

function ForumContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forumId = searchParams.get('id');

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const forum = FORUMS.find(f => f.id === forumId);

  useEffect(() => {
    if (!forumId) return;

    async function fetchPosts() {
      try {
        const q = query(
          collection(db, 'posts'),
          where('visibility', '==', 'public'),
          where('forumId', '==', forumId),
          orderBy('createdAt', 'desc'),
          limit(20)
        );

        const snapshot = await getDocs(q);
        const postsData = snapshot.docs.map(doc => ({
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Post[];

        setPosts(postsData);
      } catch (err) {
        console.error('Error fetching forum posts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [forumId]);

  if (!forumId) return null;

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-14 z-10 bg-slate-950/80 backdrop-blur border-b border-slate-800 p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronRight className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <span>{forum?.icon}</span>
            {forum?.title || 'פורום'}
          </h1>
          <p className="text-xs text-slate-400 line-clamp-1">{forum?.description}</p>
        </div>
      </div>

      {/* Posts */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.postId} post={post} />
          ))
        ) : (
          <div className="text-center py-12 text-slate-500">
            אין פוסטים בפורום זה עדיין.
          </div>
        )}
      </div>

      <CreatePostButton />
    </div>
  );
}

export default function ForumPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">טוען פורום...</div>}>
      <ForumContent />
    </Suspense>
  );
}
