"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db, functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { PostDoc } from "@/types/db";
import { PostCard } from "@/components/PostCard";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface CommentDoc {
  id: string;
  postId: string;
  authorUid: string;
  authorDisplayName: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: any;
}

export default function PostDetailPage() {
  const { postId } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState<PostDoc | null>(null);
  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [loadingPost, setLoadingPost] = useState(true);

  // Comment Form State
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        const docRef = doc(db, "posts", postId as string);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setPost({ id: snap.id, ...snap.data() } as PostDoc);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
      } finally {
        setLoadingPost(false);
      }
    };

    fetchPost();

    // Real-time comments
    const q = query(
      collection(db, "posts", postId as string, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CommentDoc[];
      setComments(newComments);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;

    setSubmitting(true);
    try {
      const createComment = httpsCallable(functions, "createComment");
      await createComment({
        postId: postId,
        content: commentText,
      });
      setCommentText("");
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPost) return <div className="p-8 text-center text-white">Loading post...</div>;
  if (!post) return <div className="p-8 text-center text-white">Post not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-md mx-auto p-4 pt-6">
        <PostCard post={post} />

        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4">Comments ({comments.length})</h3>

          <div className="space-y-4 mb-8">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-3 bg-gray-900 rounded-lg">
                <Avatar src={comment.authorPhotoURL} fallback={comment.authorDisplayName.charAt(0)} size="sm" />
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-sm">{comment.authorDisplayName}</span>
                    <span className="text-xs text-gray-500">
                      {comment.createdAt?.toDate ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : "Just now"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && <p className="text-gray-500 text-sm">No comments yet.</p>}
          </div>

          {user && (
            <form onSubmit={handleCommentSubmit} className="flex flex-col gap-2 sticky bottom-20 bg-black p-2 border-t border-gray-800">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="min-h-[60px]"
                required
              />
              <Button type="submit" disabled={submitting} size="sm" className="self-end">
                {submitting ? "Posting..." : "Comment"}
              </Button>
            </form>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
