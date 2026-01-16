"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, Timestamp } from "firebase/firestore";
import { PostCard } from "@/components/ui/PostCard";
import { PostSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

interface Forum {
  name: string;
  description: string;
}

export default function ForumPage() {
  const { forumId } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [forum, setForum] = useState<Forum | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!forumId) return;

    // Fetch Forum Details
    const fetchForum = async () => {
      try {
        const docRef = doc(db, "forums", forumId as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setForum(docSnap.data() as Forum);
        }
      } catch (error) {
        console.error("Error fetching forum details:", error);
      }
    };
    fetchForum();

    // Fetch Posts
    const q = query(
      collection(db, "posts"),
      where("forumId", "==", forumId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(newPosts);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching forum posts:", error);
      toast.error("Failed to load posts");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [forumId]);

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/forums" className="p-2 -ml-2 text-slate-400 hover:text-white">
           <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
           {loading && !forum ? (
              <Skeleton className="w-32 h-6" />
           ) : (
              <h1 className="text-xl font-bold text-slate-100">{forum?.name || "Forum"}</h1>
           )}
        </div>
      </div>

      {loading ? (
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
          No posts in this forum yet.
        </div>
      )}
    </div>
  );
}
