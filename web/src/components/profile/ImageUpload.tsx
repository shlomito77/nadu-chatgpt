'use client';

import { useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  path: string; // e.g. 'public' or 'private'
}

export function ImageUpload({ onUploadComplete, path }: ImageUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      setError('הקובץ גדול מדי (מקסימום 5MB)');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('ניתן להעלות תמונות בלבד');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const timestamp = Date.now();
      const storageRef = ref(storage, `users/${user.uid}/${path}/${timestamp}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        },
        (error) => {
          console.error(error);
          setError('שגיאה בהעלאת התמונה');
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          onUploadComplete(downloadURL);
          setUploading(false);
          setProgress(0);
        }
      );
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={uploading}
        />
        <Button variant="outline" className="w-full border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-800" disabled={uploading}>
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4 mr-2" />
          )}
          {uploading ? `מעלה... ${Math.round(progress)}%` : 'העלה תמונה'}
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
