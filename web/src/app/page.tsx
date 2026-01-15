"use client";

import PostCard from "@/components/feed/PostCard";
import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface Post {
  id: string;
  authorName?: string; // Denormalized or fetched
  text: string; // or content
  createdAt: any;
}

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
        try {
            // MVP: Assuming 'posts' collection exists.
            // If empty, we show empty state.
            const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(20));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Post[];
            setPosts(data);
        } catch (e) {
            console.error("Error fetching posts:", e);
        } finally {
            setLoading(false);
        }
    }

    fetchPosts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Create Post Prompt (Mobile style) */}
      {user && (
        <div className="flex items-center space-x-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold">
                {user.displayName?.[0] || "U"}
            </div>
            <Link href="/create" className="flex-1 bg-slate-950 hover:bg-slate-800 text-slate-500 rounded-full py-2 px-4 text-sm transition-colors">
                What's happening?
            </Link>
        </div>
      )}

      {/* Feed */}
      {loading ? (
        <div className="text-center py-10 text-slate-500">Loading feed...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
            <p>No posts yet.</p>
            <p className="text-xs mt-2">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4">
            {posts.map(post => (
                <PostCard
                    key={post.id}
                    id={post.id}
                    authorName={post.authorName || "Anonymous"}
                    text={post.text || "No content"}
                    createdAt={post.createdAt}
                />
            ))}
        </div>
      )}
    </div>
  );
}
