'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  IdTokenResult,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthState {
  user: User | null;
  claims: IdTokenResult['claims'] | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<IdTokenResult['claims'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Only subscribe to auth changes on client-side
    // This is redundant with 'use client' but extra safe
    if (typeof window === 'undefined') return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Get Custom Claims
        try {
          const tokenResult = await currentUser.getIdTokenResult();
          setClaims(tokenResult.claims);
        } catch (e) {
          console.error('Error fetching claims', e);
        }
      } else {
        setClaims(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, claims, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
