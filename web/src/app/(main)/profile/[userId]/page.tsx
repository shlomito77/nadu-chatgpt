'use client';

import { useEffect, useState, Suspense } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AppUser } from '@/types';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { GalleryTab } from '@/components/profile/GalleryTab';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useParams } from 'next/navigation';

function PublicProfileContent() {
  const { user } = useAuth();
  const params = useParams();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const docRef = doc(db, 'users', userId);
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

    if (userId) fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!profile) {
    return <div className="p-8 text-center text-slate-500">משתמש לא נמצא</div>;
  }

  const isOwnProfile = user?.uid === userId;

  return (
    <div className="space-y-6 pb-20">
      <ProfileHeader user={profile} isOwnProfile={isOwnProfile} />
      <div className="px-4">
        <GalleryTab uid={profile.uid} isOwnProfile={isOwnProfile} />
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return [];
}

export default function PublicProfilePage() {
  return <PublicProfileContent />;
}
