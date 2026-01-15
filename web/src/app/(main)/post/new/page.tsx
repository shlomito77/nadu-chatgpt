'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function CreatePostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const functions = getFunctions();
      const createPost = httpsCallable(functions, 'createPost');

      await createPost({
        title,
        content,
        isAnonymous
      });

      router.push('/');
    } catch (err) {
      console.error('Error creating post:', err);
      alert('שגיאה ביצירת הפוסט');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronRight className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">פוסט חדש</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="כותרת הפוסט"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          required
          minLength={3}
          maxLength={200}
          className="text-lg font-bold bg-transparent border-none px-0 focus:ring-0 placeholder:text-slate-600"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          required
          minLength={10}
          className="w-full min-h-[300px] bg-transparent border-none resize-none focus:outline-none text-slate-200 placeholder:text-slate-600"
          placeholder="מה עובר עליך?..."
        />

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between z-50">
           <Button
            type="button"
            variant={isAnonymous ? 'secondary' : 'ghost'}
            onClick={() => setIsAnonymous(!isAnonymous)}
            className="gap-2"
          >
            {isAnonymous ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isAnonymous ? 'אנונימי' : 'מזוהה'}
          </Button>

          <Button type="submit" disabled={loading} className="px-8">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            פרסם
          </Button>
        </div>
      </form>
    </div>
  );
}
