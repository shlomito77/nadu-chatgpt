"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, getCountFromServer, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useFollow } from "@/hooks/useFollow";
import { useBlock } from "@/hooks/useBlock";
import { UserPlus, UserMinus, ArrowLeft, Ban } from "lucide-react";
import Link from "next/link";
import ReportButton from "@/components/ui/ReportButton";

interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
}

export default function PublicProfilePage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const targetUid = params.uid as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ posts: 0, following: 0, followers: 0 });

  const { isFollowing, toggleFollow, loading: followLoading } = useFollow(targetUid);
  const { isBlocked, toggleBlock, loading: blockLoading } = useBlock(targetUid);

  useEffect(() => {
    if (user && user.uid === targetUid) {
        router.replace("/profile");
    }
  }, [user, targetUid, router]);

  useEffect(() => {
    async function fetchData() {
        if (!targetUid) return;
        try {
            const docRef = doc(db, "users", targetUid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setProfile({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
            }

            const followingCount = (await getCountFromServer(collection(db, "users", targetUid, "following"))).data().count;
            const followersCount = (await getCountFromServer(collection(db, "users", targetUid, "followers"))).data().count;
            setStats({ posts: 0, following: followingCount, followers: followersCount });

        } catch (e) {
            console.error("Error loading profile", e);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [targetUid]);

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>User not found.</div>;

  if (isBlocked) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
              <Ban size={48} className="text-red-500" />
              <h1 className="text-xl font-bold">You blocked this user.</h1>
              <button
                onClick={toggleBlock}
                className="text-indigo-400 hover:underline"
              >
                  Unblock to view profile
              </button>
          </div>
      );
  }

  return (
    <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <Link href="/" className="mr-4 text-slate-400">
                    <ArrowLeft />
                </Link>
                <h1 className="font-bold">Profile</h1>
            </div>
            <div className="flex space-x-2">
                <button
                    onClick={toggleBlock}
                    className="p-1 text-slate-500 hover:text-red-500 transition-colors"
                    title="Block User"
                >
                    <Ban size={16} />
                </button>
                <ReportButton targetId={targetUid} targetType="user" />
            </div>
        </div>

      {/* Header */}
      <div className="relative h-32 bg-gradient-to-r from-slate-800 to-slate-700 rounded-b-2xl -mx-4 -mt-4 mb-12">
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 rounded-full border-4 border-slate-950 bg-slate-800 overflow-hidden relative">
             {profile.photoURL ? (
                 <Image src={profile.photoURL} alt={profile.displayName} fill className="object-cover" />
             ) : (
                 <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-2xl font-bold">
                     {profile.displayName?.[0]}
                 </div>
             )}
          </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">{profile.displayName}</h1>
        <p className="text-slate-300">{profile.bio || "No bio yet."}</p>

        {user && (
            <button
                onClick={toggleFollow}
                disabled={followLoading}
                className={`mt-4 px-6 py-2 rounded-full font-bold flex items-center justify-center mx-auto transition-all ${
                    isFollowing
                    ? "bg-slate-800 text-slate-300 border border-slate-700"
                    : "bg-indigo-600 text-white hover:bg-indigo-500"
                }`}
            >
                {isFollowing ? (
                    <>
                        <UserMinus size={18} className="mr-2" /> Unfollow
                    </>
                ) : (
                    <>
                        <UserPlus size={18} className="mr-2" /> Follow
                    </>
                )}
            </button>
        )}
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
    </div>
  );
}
