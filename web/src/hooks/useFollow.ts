import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export function useFollow(targetUid: string) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkFollowStatus() {
      if (!user || !targetUid) {
        setLoading(false);
        return;
      }
      try {
        // Check if I am in their followers list
        const ref = doc(db, "users", targetUid, "followers", user.uid);
        const snap = await getDoc(ref);
        setIsFollowing(snap.exists());
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setLoading(false);
      }
    }
    checkFollowStatus();
  }, [user, targetUid]);

  const toggleFollow = async () => {
    if (!user || !targetUid) return;

    // Optimistic update
    const previousState = isFollowing;
    setIsFollowing(!previousState);

    try {
      const followerRef = doc(db, "users", targetUid, "followers", user.uid);
      const followingRef = doc(db, "users", user.uid, "following", targetUid);

      if (previousState) {
        // Unfollow
        await deleteDoc(followerRef);
        await deleteDoc(followingRef);
      } else {
        // Follow
        const data = { createdAt: serverTimestamp(), uid: user.uid, displayName: user.displayName };
        await setDoc(followerRef, data);
        await setDoc(followingRef, { createdAt: serverTimestamp(), uid: targetUid });
      }
    } catch (error) {
      console.error("Follow toggle failed:", error);
      setIsFollowing(previousState); // Revert
    }
  };

  return { isFollowing, toggleFollow, loading };
}
