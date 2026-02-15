"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserDoc } from "@/types/db";
import { Avatar } from "@/components/ui/Avatar";
import { BottomNav } from "@/components/BottomNav";
import { useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default function PublicProfilePage() {
  const { uid } = useParams(); // Get uid from URL
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", uid as string);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setProfile(snap.data() as UserDoc);
        } else {
          console.error("Profile not found");
        }
      } catch (err) {
        console.error("Error fetching public profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [uid]);

  if (loading) return <div className="p-8 text-center text-white">Loading...</div>;
  if (!profile) return <div className="p-8 text-center text-white">User not found.</div>;

  const joinedDate = profile.createdAt?.toDate ? profile.createdAt.toDate() : new Date();

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-md mx-auto p-4 pt-8">
        <div className="flex flex-col items-center mb-8">
          <Avatar
            src={profile.photoURL}
            fallback={profile.displayName.charAt(0)}
            size="lg"
            className="mb-4 w-32 h-32 text-4xl"
          />
          <h1 className="text-2xl font-bold">{profile.displayName}</h1>
          {profile.region && <p className="text-gray-400 text-sm mt-1">{profile.region}</p>}
        </div>

        <div className="bg-gray-900 rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">About</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{profile.bio || "No bio yet."}</p>
          </div>

          <div className="pt-4 border-t border-gray-800 flex justify-between text-sm text-gray-500">
            <span>Joined</span>
            <span>{formatDistanceToNow(joinedDate, { addSuffix: true })}</span>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
