"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { UserDoc } from "@/types/db";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { BottomNav } from "@/components/BottomNav";
import { ReportDialog } from "@/components/moderation/ReportDialog"; // Import ReportDialog
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

export default function PublicProfilePage() {
  const { uid } = useParams(); // Get uid from URL
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

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

  const handleMessage = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setChatLoading(true);
    try {
      const createChat = httpsCallable(functions, "createChat");
      // Use the function to get or create chat ID
      const result = await createChat({ targetUid: uid });
      const { chatId } = result.data as { chatId: string };
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error("Failed to start chat", error);
      alert("Could not start chat.");
      setChatLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-white">Loading...</div>;
  if (!profile) return <div className="p-8 text-center text-white">User not found.</div>;

  const joinedDate = profile.createdAt?.toDate ? profile.createdAt.toDate() : new Date();
  const isOwnProfile = user?.uid === uid;

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-md mx-auto p-4 pt-8">
        <div className="flex flex-col items-center mb-8 relative">
          <Avatar
            src={profile.photoURL}
            fallback={profile.displayName.charAt(0)}
            size="lg"
            className="mb-4 w-32 h-32 text-4xl"
          />
          <h1 className="text-2xl font-bold">{profile.displayName}</h1>
          {profile.region && <p className="text-gray-400 text-sm mt-1">{profile.region}</p>}

          <div className="flex gap-2 mt-6">
            {!isOwnProfile && (
              <>
                <Button
                  className="w-32"
                  onClick={handleMessage}
                  disabled={chatLoading}
                >
                  {chatLoading ? "Starting..." : "Message"}
                </Button>
                {/* Report User Button */}
                <div className="flex items-center">
                   <ReportDialog targetType="user" targetId={uid as string} />
                </div>
              </>
            )}
          </div>
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
