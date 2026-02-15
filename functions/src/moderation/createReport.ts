import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { z } from "zod";

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// 1. Validation Schema
const CreateReportSchema = z.object({
  targetType: z.enum(['post', 'comment', 'user', 'chat']),
  targetId: z.string().min(1),
  reason: z.string().min(1),
  description: z.string().optional(),
});

export const createReport = functions.https.onCall(async (request) => {
  // 2. Auth Check
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be logged in to report."
    );
  }

  const { uid } = request.auth;
  const parseResult = CreateReportSchema.safeParse(request.data);

  if (!parseResult.success) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid data.",
      parseResult.error.flatten()
    );
  }

  const { targetType, targetId, reason, description } = parseResult.data;
  const now = admin.firestore.Timestamp.now();

  try {
    // 3. Fetch Target Content for Snapshot
    let snapshotData = {};
    let targetRefPath = "";

    if (targetType === 'user') {
      const snap = await db.collection("users").doc(targetId).get();
      if (snap.exists) snapshotData = snap.data() || {};
      targetRefPath = `users/${targetId}`;
    } else if (targetType === 'post') {
      const snap = await db.collection("posts").doc(targetId).get();
      if (snap.exists) snapshotData = snap.data() || {};
      targetRefPath = `posts/${targetId}`;
    } else if (targetType === 'comment') {
      // Assuming comments are subcollection of posts, but we only have ID here.
      // In a real app, we might need parentId or query group collection.
      // For MVP simplify: require parentId or assume flat structure if possible (not the case here).
      // Let's store minimal info or require client to pass content if complex.
      // For now, we'll skip deep fetch for comments or trust client context is enough for MVP.
      targetRefPath = `comments/${targetId}`; // Placeholder
    }

    // 4. Create Report Document
    const reportRef = db.collection("reports").doc();

    const newReport = {
      id: reportRef.id,
      reporterUid: uid,
      targetType,
      targetId,
      targetRef: targetRefPath,
      reason,
      description: description || "",
      snapshot: snapshotData, // Evidence
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    await reportRef.set(newReport);

    return { reportId: reportRef.id, success: true };

  } catch (error) {
    console.error("Error creating report:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Unable to submit report.");
  }
});
