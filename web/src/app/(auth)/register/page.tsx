'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name immediately
      await updateProfile(userCredential.user, {
        displayName: username
      });

      // Redirect (onUserCreate trigger will handle the rest in background)
      router.push('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('האימייל כבר קיים במערכת');
      } else {
        setError('שגיאה בהרשמה: נסה שנית מאוחר יותר');
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-slate-900 border-slate-800">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center text-white">הרשמה ל-NADU</CardTitle>
        <CardDescription className="text-center text-slate-400">
          צור חשבון חדש והצטרף לקהילה
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <Input
            label="שם משתמש"
            type="text"
            placeholder="כינוי באתר"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            required
            minLength={3}
          />
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
          <Input
            label="אימות סיסמה"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            הרשם
          </Button>
          <p className="text-sm text-center text-slate-400">
            כבר יש לך חשבון?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              התחבר
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
