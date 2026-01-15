"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/ui/ImageUploader";

export default function CreatePostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!text.trim() && !imageUrl)) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "posts"), {
        text: text.trim(),
        imageUrl: imageUrl || null,
        authorId: user.uid,
        authorName: user.displayName || "Anonymous",
        createdAt: serverTimestamp(),
        visibility: "public",
        likes: 0,
        commentCount: 0
      });
      router.push("/");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Check console.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center mt-20">Please log in to post.</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4 text-slate-400 hover:text-white">
            <ArrowLeft />
        </Link>
        <h1 className="text-xl font-bold">New Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
        <textarea
          className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg"
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
        />

        <div className="h-32">
            <ImageUploader
                onUpload={setImageUrl}
                pathPrefix={`posts/${user.uid}`}
                currentImage={imageUrl}
                className="w-32 h-32"
            />
        </div>

        <div className="flex justify-between items-center text-slate-500 text-sm px-2">
            <span>{text.length}/500</span>
        </div>

        <button
          type="submit"
          disabled={loading || (!text.trim() && !imageUrl)}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
            loading || (!text.trim() && !imageUrl)
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
          }`}
        >
          {loading ? (
            <span>Posting...</span>
          ) : (
            <>
              <Send size={18} />
              <span>Post</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
