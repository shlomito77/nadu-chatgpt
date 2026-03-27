import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { z } from "zod";
import { PostDoc } from "../types/db";

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// 1. Define Validation Schema
const CreatePostSchema = z.object({
  title: z.string().min(5).max(100),
  content: z.string().min(10).max(5000),
  visibility: z.enum(["public", "members"]),
  isAnonymous: z.boolean().optional().default(false),
  tags: z.array(z.string()).max(5).optional(),
  imagePaths: z.array(z.string()).optional(),
});

// type CreatePostRequest = z.infer<typeof CreatePostSchema>; // Unused type removed

export const createPost = functions.https.onCall(async (request) => {
  // 2. Auth Check
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be logged in to create a post."
    );
  }

  const { uid } = request.auth; // Removed unused 'token'

  // 3. Validation
  const parseResult = CreatePostSchema.safeParse(request.data);
  if (!parseResult.success) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid data.",
      parseResult.error.flatten()
    );
  }

  const data = parseResult.data;
  const now = admin.firestore.Timestamp.now();

  try {
    // 4. Get User Profile (for denormalization)
    const userSnap = await db.collection("users").doc(uid).get();
    if (!userSnap.exists) {
      throw new functions.https.HttpsError("not-found", "User profile not found.");
    }
    const userData = userSnap.data();

    // 5. Construct Post Document
    const postRef = db.collection("posts").doc();
    const newPost: PostDoc = {
      id: postRef.id,
      authorUid: uid,
      authorDisplayName: userData?.displayName || "Unknown",
      authorPhotoURL: userData?.photoURL,

      title: data.title,
      content: data.content,
      images: data.imagePaths?.map(url => ({ url, path: url })) || [],

      isAnonymous: data.isAnonymous,
      visibility: data.visibility,
      tags: data.tags || [],

      commentCount: 0,
      likeCount: 0,
      score: 0,

      createdAt: now,
      updatedAt: now,
    };

    // 6. Write to Firestore
    await postRef.set(newPost);

    return { postId: postRef.id, success: true };

  } catch (error) {
    console.error("Error creating post:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Unable to create post.");
  }
});
