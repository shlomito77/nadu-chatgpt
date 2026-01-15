'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AppUser } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function EditProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState('other');

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as AppUser;
          setProfile(data);
          setDisplayName(data.displayName || '');
          setBio(data.bio || '');
          setRole(data.role || 'other');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const functions = getFunctions();
      const updateProfile = httpsCallable(functions, 'updateProfile');

      await updateProfile({
        displayName,
        bio,
        role
      });

      router.push('/profile');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('שגיאה בעדכון הפרופיל');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">טוען...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronRight className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">עריכת פרופיל</h1>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">פרטים אישיים</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="שם תצוגה"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={saving}
              required
              minLength={2}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">תפקיד</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={saving}
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="dom">Dominant</option>
                <option value="sub">Submissive</option>
                <option value="switch">Switch</option>
                <option value="curious">Curious</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">אודות (Bio)</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={saving}
                className="flex min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="ספר/י על עצמך..."
              />
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              שמור שינויים
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
