"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, Settings, Camera } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div className="text-center mt-20">Please log in.</div>;

  return (
    <div className="flex flex-col space-y-6">
      {/* Header / Cover Area (Simulated) */}
      <div className="relative h-32 bg-gradient-to-r from-slate-800 to-slate-700 rounded-b-2xl -mx-4 -mt-4 mb-12">
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <div className="relative w-24 h-24 rounded-full border-4 border-slate-950 overflow-hidden bg-slate-800">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || "User"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-indigo-600">
                {user.displayName?.charAt(0) || "U"}
              </div>
            )}
            <button className="absolute bottom-0 right-0 p-1 bg-slate-900/50 backdrop-blur rounded-full text-white">
                <Camera size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">{user.displayName || "Anonymous"}</h1>
        <p className="text-sm text-slate-400">@{user.uid.slice(0, 8)}</p>
        <p className="text-slate-300">Just here for the vibes. ✨</p>
      </div>

      {/* Stats (Mock) */}
      <div className="flex justify-around py-4 border-y border-slate-800">
        <div className="text-center">
          <div className="text-xl font-bold">0</div>
          <div className="text-xs text-slate-500">Posts</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">0</div>
          <div className="text-xs text-slate-500">Following</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">0</div>
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
