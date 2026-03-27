"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { BottomNav } from "@/components/BottomNav";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setDisplayName(data.displayName || "");
          setBio(data.bio || "");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage("");

    try {
      const updateProfile = httpsCallable(functions, "updateProfile");
      await updateProfile({
        displayName,
        bio,
      });
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-white">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="max-w-md mx-auto p-4 pt-8">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

        <div className="flex flex-col items-center mb-8">
          <Avatar
            src={user.photoURL || undefined}
            fallback={displayName?.charAt(0) || user.email?.charAt(0) || "U"}
            size="lg"
            className="mb-4 w-24 h-24 text-2xl"
          />
          <p className="text-gray-400 text-sm">{user.email}</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your public name"
          />

          <Textarea
            label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            rows={4}
          />

          {message && (
            <p className={`text-sm text-center ${message.includes("Success") ? "text-green-500" : "text-red-500"}`}>
              {message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>

        <div className="mt-12 border-t border-gray-800 pt-6">
          <Button
            variant="danger"
            className="w-full"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            Log Out
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
