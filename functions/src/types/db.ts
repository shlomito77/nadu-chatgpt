import { Timestamp } from 'firebase-admin/firestore';

export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  region?: string;
  dob: string;
  age: number;
  lastSeen?: Timestamp;
  isOnline?: boolean;
  privacy: {
    showAge: boolean;
    showLocation: boolean;
    allowDMs: boolean;
  };
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
