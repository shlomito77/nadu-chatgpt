"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PostDoc } from "@/types/db";
import { PostCard } from "@/components/PostCard";
import { CreatePostForm } from "@/components/CreatePostForm";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // MVP Query: Public posts, ordered by newest
    // Note: Requires composite index (visibility asc, createdAt desc)
    const q = query(
      collection(db, "posts"),
      where("visibility", "==", "public"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PostDoc[];

      setPosts(newPosts);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) return <div className="p-8 text-center">Loading auth...</div>;
  if (!user) return <div className="p-8 text-center">Please log in to view the feed.</div>;

  return (
    <div className="min-h-screen pb-24 bg-black text-white">
      <div className="max-w-md mx-auto p-4 pt-6">
        <h1 className="text-2xl font-bold mb-6">Feed</h1>

        <CreatePostForm />

        <div className="space-y-4">
          {loading && <p className="text-center text-gray-500">Loading posts...</p>}
          {!loading && posts.length === 0 && (
            <p className="text-center text-gray-500">No posts yet. Be the first!</p>
          )}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
