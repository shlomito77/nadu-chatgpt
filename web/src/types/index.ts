// Firebase
import { Timestamp } from 'firebase/firestore';

// App types
export interface AppUser {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL?: string;
  role: 'dom' | 'sub' | 'switch' | 'curious' | 'other';
  bio?: string;
  age: number;
  sex: string;
  orientation?: string;
  interests?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  postId: string;
  authorUid: string;
  authorUsername: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData extends LoginFormData {
  username: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

// API responses
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
