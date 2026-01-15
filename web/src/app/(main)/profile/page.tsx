'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AppUser } from '@/types';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GalleryTab } from '@/components/profile/GalleryTab';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data() as AppUser);
        } else {
          console.error('No profile found');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!profile) {
    return <div>פרופיל לא נמצא</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <ProfileHeader user={profile} isOwnProfile={true} />

      <div className="px-4 space-y-6">
        <GalleryTab uid={profile.uid} isOwnProfile={true} />

        <Button
          variant="outline"
          onClick={() => signOut()}
          className="w-full text-red-400 hover:text-red-300 border-slate-800 hover:bg-slate-900"
        >
          התנתק
        </Button>
      </div>
    </div>
  );
}
