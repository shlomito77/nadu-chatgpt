'use client';

import { useEffect, useState } from 'react';
import { storage, db } from '@/lib/firebase';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { ImageUpload } from './ImageUpload';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Lock, Globe } from 'lucide-react';
import { cn } from '@/lib/cn';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

interface GalleryTabProps {
  uid: string;
  isOwnProfile: boolean;
}

export function GalleryTab({ uid, isOwnProfile }: GalleryTabProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real app, we would store photo references in Firestore for efficiency/ordering.
  // For MVP/Phase 1, we list from Storage directly (slower, but works).
  // Actually, specs say "Storage rules". Let's stick to listing from storage for simplicity now,
  // OR better: save URL to Firestore 'users/{uid}/photos' subcollection on upload.

  // Let's implement the Firestore reference approach for better performance/rules.
  // BUT we don't have that yet. So LIST from storage is MVP.

  const fetchPhotos = async () => {
    setLoading(true);
    setPhotos([]);
    try {
      const folderRef = ref(storage, `users/${uid}/${activeTab}`);
      const res = await listAll(folderRef);
      const urls = await Promise.all(res.items.map((item) => getDownloadURL(item)));
      setPhotos(urls);
    } catch (err) {
      console.error('Error fetching photos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'private' && !isOwnProfile) {
      // Logic for private access checking would go here
      return;
    }
    fetchPhotos();
  }, [uid, activeTab]);

  const handleUploadSuccess = (url: string) => {
    setPhotos(prev => [url, ...prev]);
    // Optional: Save to Firestore for persistence reference
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 p-1 bg-slate-900 rounded-lg">
        <button
          onClick={() => setActiveTab('public')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2",
            activeTab === 'public' ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Globe className="h-4 w-4" />
          ציבורי
        </button>
        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('private')}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2",
              activeTab === 'private' ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Lock className="h-4 w-4" />
            פרטי
          </button>
        )}
      </div>

      {isOwnProfile && (
        <div className="bg-slate-900/30 p-4 rounded-xl border border-dashed border-slate-800">
          <ImageUpload onUploadComplete={handleUploadSuccess} path={activeTab} />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3].map(i => <div key={i} className="aspect-square bg-slate-800 animate-pulse rounded-lg" />)}
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url, idx) => (
            <div key={idx} className="aspect-square relative overflow-hidden rounded-lg bg-slate-800 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Gallery" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-xl">
          אין תמונות בתיקייה זו
        </div>
      )}
    </div>
  );
}
