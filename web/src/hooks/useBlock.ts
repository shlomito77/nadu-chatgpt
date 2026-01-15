import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export function useBlock(targetUid: string) {
  const { user } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkBlockStatus() {
      if (!user || !targetUid) {
        setLoading(false);
        return;
      }
      try {
        const ref = doc(db, "users", user.uid, "blocked", targetUid);
        const snap = await getDoc(ref);
        setIsBlocked(snap.exists());
      } catch (error) {
        console.error("Error checking block status:", error);
      } finally {
        setLoading(false);
      }
    }
    checkBlockStatus();
  }, [user, targetUid]);

  const toggleBlock = async () => {
    if (!user || !targetUid) return;

    const previousState = isBlocked;
    setIsBlocked(!previousState);

    try {
      const blockRef = doc(db, "users", user.uid, "blocked", targetUid);

      if (previousState) {
        await deleteDoc(blockRef);
      } else {
        await setDoc(blockRef, {
            uid: targetUid,
            createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Block toggle failed:", error);
      setIsBlocked(previousState);
    }
  };

  return { isBlocked, toggleBlock, loading };
}
