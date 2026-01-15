'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      setError('שגיאה בהתחברות: בדוק את המייל והסיסמה');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-slate-900 border-slate-800">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center text-white">התחברות ל-NADU</CardTitle>
        <CardDescription className="text-center text-slate-400">
          הכנס את המייל והסיסמה שלך כדי להמשיך
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <Input
            label="אימייל"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            dir="ltr"
            className="text-right"
          />
          <Input
            label="סיסמה"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            dir="ltr"
            className="text-right"
          />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            התחבר
          </Button>
          <p className="text-sm text-center text-slate-400">
            אין לך חשבון?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              הרשם עכשיו
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
