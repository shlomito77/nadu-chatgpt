import { Timestamp } from 'firebase/firestore';

export interface UserDoc {
  uid: string;
  email: string; // PII - visible only to owner/admin via rules
  displayName: string;
  photoURL?: string;
  bio?: string;

  // Location
  region?: string;

  // Age Verification
  dob: string; // ISO date string (YYYY-MM-DD)
  age: number; // Calculated by server

  // Status
  lastSeen?: Timestamp;
  isOnline?: boolean;

  // Privacy Settings
  privacy: {
    showAge: boolean;
    showLocation: boolean;
    allowDMs: boolean;
  };

  // Trust & Safety
  isVerified: boolean;
  role: 'user' | 'admin' | 'moderator';
  flags: {
    isBanned: boolean;
    isShadowBanned: boolean;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PostDoc {
  id: string;
  authorUid: string;
  authorDisplayName: string;
  authorPhotoURL?: string;

  title: string;
  content: string;
  images?: { url: string; path: string }[];

  isAnonymous: boolean;
  visibility: 'public' | 'members';
  tags: string[];

  commentCount: number;
  likeCount: number;
  score: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
