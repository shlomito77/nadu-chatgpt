import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { z } from "zod";

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// 1. Define Validation Schema
const CreateCommentSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(1).max(1000),
  parentId: z.string().optional(), // For nested comments in future
});

export const createComment = functions.https.onCall(async (request) => {
  // 2. Auth Check
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be logged in to comment."
    );
  }

  const { uid } = request.auth;

  // 3. Validation
  const parseResult = CreateCommentSchema.safeParse(request.data);
  if (!parseResult.success) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid data.",
      parseResult.error.flatten()
    );
  }

  const { postId, content, parentId } = parseResult.data;
  const now = admin.firestore.Timestamp.now();

  try {
    // 4. Get User Profile (for denormalization)
    const userSnap = await db.collection("users").doc(uid).get();
    if (!userSnap.exists) {
      throw new functions.https.HttpsError("not-found", "User profile not found.");
    }
    const userData = userSnap.data();

    const postRef = db.collection("posts").doc(postId);

    // Check if post exists
    const postSnap = await postRef.get();
    if (!postSnap.exists) {
      throw new functions.https.HttpsError("not-found", "Post not found.");
    }

    // 5. Create Comment Document
    const commentRef = postRef.collection("comments").doc();

    const newComment = {
      id: commentRef.id,
      postId,
      parentId: parentId || null,
      authorUid: uid,
      authorDisplayName: userData?.displayName || "Unknown",
      authorPhotoURL: userData?.photoURL || null,

      content,

      createdAt: now,
      updatedAt: now,
    };

    // 6. Transaction: Add comment + increment count
    await db.runTransaction(async (transaction) => {
      transaction.set(commentRef, newComment);
      transaction.update(postRef, {
        commentCount: admin.firestore.FieldValue.increment(1)
      });
    });

    return { commentId: commentRef.id, success: true };

  } catch (error) {
    console.error("Error creating comment:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Unable to create comment.");
  }
});
