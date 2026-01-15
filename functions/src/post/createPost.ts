import * as logger from "firebase-functions/logger";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const db = getFirestore();

interface CreatePostRequest {
  title: string;
  content: string;
  isAnonymous: boolean;
  forumId?: string;
  tags?: string[];
}

export const createPost = onCall(async (request) => {
  // 1. Auth Check
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in to post');
  }

  const uid = request.auth.uid;
  const data = request.data as CreatePostRequest;

  logger.info(`Creating post for ${uid}`, { isAnonymous: data.isAnonymous });

  // 2. Validation
  if (!data.title || data.title.length < 3 || data.title.length > 200) {
    throw new HttpsError('invalid-argument', 'Title must be between 3 and 200 characters');
  }

  if (!data.content || data.content.length < 10 || data.content.length > 10000) {
    throw new HttpsError('invalid-argument', 'Content must be between 10 and 10000 characters');
  }

  // 3. Fetch Author Profile (Denormalization)
  const userSnap = await db.collection('users').doc(uid).get();
  if (!userSnap.exists) {
    throw new HttpsError('not-found', 'User profile not found');
  }
  const userData = userSnap.data();

  // Check if banned
  if (userData?.flags?.banned) {
    throw new HttpsError('permission-denied', 'You are banned');
  }

  try {
    // 4. Create Post Document
    const postRef = db.collection('posts').doc();
    const postId = postRef.id;

    const postDoc = {
      postId,

      // Author info
      authorUid: uid,
      authorUsername: userData?.username || 'Unknown',
      authorDisplayName: userData?.displayName || 'Unknown',
      authorPhotoURL: userData?.photoURL || null,
      isAnonymous: !!data.isAnonymous,

      // Content
      title: data.title,
      content: data.content,
      forumId: data.forumId || 'general',
      tags: data.tags || [],

      // System
      visibility: 'public',
      status: 'active',

      // Stats
      stats: {
        views: 0,
        likes: 0,
        comments: 0
      },

      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    // 5. Atomic Write (Post + User Stats)
    const batch = db.batch();
    batch.set(postRef, postDoc);
    batch.update(db.collection('users').doc(uid), {
      'stats.posts': FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp()
    });

    await batch.commit();

    logger.info(`Post created: ${postId}`);
    return { success: true, postId };

  } catch (error) {
    logger.error(`Error creating post for ${uid}`, error);
    throw new HttpsError('internal', 'Failed to create post');
  }
});
