"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { X, Lock, Users, Globe } from "lucide-react";

export default function CreateAlbumModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<"public" | "friends" | "private">("public");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "users", user.uid, "albums"), {
        title,
        visibility,
        createdAt: serverTimestamp(),
        coverUrl: null,
        photoCount: 0
      });
      onClose();
      // Optimally we'd trigger a refresh in parent
      window.location.reload();
    } catch (error) {
      console.error("Error creating album:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">New Album</h2>
            <button onClick={onClose}><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs text-slate-400 mb-1">Album Title</label>
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2"
                    placeholder="My Trip"
                    autoFocus
                />
            </div>

            <div>
                <label className="block text-xs text-slate-400 mb-2">Visibility</label>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={() => setVisibility("public")}
                        className={`flex flex-col items-center p-3 rounded-xl border ${visibility === 'public' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-800 bg-slate-950 text-slate-500'}`}
                    >
                        <Globe size={20} className="mb-1" />
                        <span className="text-xs">Public</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setVisibility("friends")}
                        className={`flex flex-col items-center p-3 rounded-xl border ${visibility === 'friends' ? 'border-pink-500 bg-pink-500/10 text-pink-400' : 'border-slate-800 bg-slate-950 text-slate-500'}`}
                    >
                        <Users size={20} className="mb-1" />
                        <span className="text-xs">Friends</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setVisibility("private")}
                        className={`flex flex-col items-center p-3 rounded-xl border ${visibility === 'private' ? 'border-slate-400 bg-slate-400/10 text-slate-200' : 'border-slate-800 bg-slate-950 text-slate-500'}`}
                    >
                        <Lock size={20} className="mb-1" />
                        <span className="text-xs">Private</span>
                    </button>
                </div>
            </div>

            <button disabled={loading} className="w-full bg-white text-black font-bold py-3 rounded-xl">
                {loading ? "Creating..." : "Create Album"}
            </button>
        </form>
      </div>
    </div>
  );
}
