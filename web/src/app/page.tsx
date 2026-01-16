"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { PostCard } from "@/components/ui/PostCard";
import { PostSkeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";

interface Post {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  imageURL?: string;
  createdAt: Timestamp;
  likes: number;
  commentsCount: number;
}

export default function Home() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (!user) {
        setLoadingPosts(false);
        return;
    }

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(newPosts);
      setLoadingPosts(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load feed");
      setLoadingPosts(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (authLoading) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-4 pt-6 pb-24">
         <PostSkeleton />
         <PostSkeleton />
         <PostSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          The Cage
        </h1>
        <p className="text-slate-400 mb-8 max-w-sm">
          Join the community. Share your moments. Connect with friends.
        </p>
        <button
          onClick={() => signInWithGoogle()}
          className="bg-slate-100 text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-white transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-md mx-auto p-4 space-y-4 pt-6 pb-24">
      {/* Header / Create Post Placeholder */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-slate-100">Your Feed</h1>
      </div>

      {loadingPosts ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length > 0 ? (
        posts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            content={post.content}
            authorId={post.authorId}
            authorName={post.authorName}
            authorPhotoURL={post.authorPhotoURL}
            imageURL={post.imageURL}
            createdAt={post.createdAt}
            likes={post.likes || 0}
            commentsCount={post.commentsCount || 0}
          />
        ))
      ) : (
        <div className="text-center py-10 text-slate-500">
          No posts yet. Be the first to post!
        </div>
      )}
    </main>
  );
}
