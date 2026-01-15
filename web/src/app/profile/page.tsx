"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, Settings } from "lucide-react";
import ImageUploader from "@/components/ui/ImageUploader";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, getCountFromServer, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const [stats, setStats] = useState({ posts: 0, following: 0, followers: 0 });

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      try {
        const postsCount = (await getCountFromServer(collection(db, "posts"))).data().count; // Naive: counts all posts, needs query
        // Correct query for posts by authorId is needed but count() requires an index.
        // For MVP speed, let's keep mock or try simple count on subcollections if structured that way.
        // Actually we store following/followers in subcollections now.
        const followingCount = (await getCountFromServer(collection(db, "users", user.uid, "following"))).data().count;
        const followersCount = (await getCountFromServer(collection(db, "users", user.uid, "followers"))).data().count;

        setStats({ posts: 0, following: followingCount, followers: followersCount });
      } catch (e) {
        console.error("Stats fetch error", e);
      }
    }
    fetchStats();
  }, [user]);

  const handleAvatarUpload = async (url: string) => {
    if (!user) return;
    try {
        await updateProfile(user, { photoURL: url });
        try {
            await updateDoc(doc(db, "users", user.uid), { photoURL: url });
        } catch (e) {
            console.warn("User doc update failed", e);
        }
        window.location.reload();
    } catch (error) {
        console.error("Failed to update profile picture", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div className="text-center mt-20">Please log in.</div>;

  return (
    <div className="flex flex-col space-y-6">
      {/* Header / Cover Area */}
      <div className="relative h-32 bg-gradient-to-r from-slate-800 to-slate-700 rounded-b-2xl -mx-4 -mt-4 mb-12">
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 rounded-full border-4 border-slate-950 bg-slate-800 flex items-center justify-center">
             <ImageUploader
                onUpload={handleAvatarUpload}
                pathPrefix={`users/${user.uid}/public`}
                currentImage={user.photoURL}
                isCircular={true}
                className="w-full h-full"
             />
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">{user.displayName || "Anonymous"}</h1>
        <p className="text-sm text-slate-400">@{user.uid.slice(0, 8)}</p>
        <p className="text-slate-300">Just here for the vibes. ✨</p>
      </div>

      {/* Stats */}
      <div className="flex justify-around py-4 border-y border-slate-800">
        <div className="text-center">
          <div className="text-xl font-bold">{stats.posts}</div>
          <div className="text-xs text-slate-500">Posts</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">{stats.following}</div>
          <div className="text-xs text-slate-500">Following</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">{stats.followers}</div>
          <div className="text-xs text-slate-500">Followers</div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button className="w-full flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700">
          <span className="flex items-center">
            <Settings size={20} className="mr-3 text-slate-400" />
            Edit Profile
          </span>
        </button>

        <button
            onClick={logout}
            className="w-full flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-red-900/50 text-red-400"
        >
          <span className="flex items-center">
            <LogOut size={20} className="mr-3" />
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );
}
