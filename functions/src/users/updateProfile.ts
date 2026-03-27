import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { z } from "zod";
import { UserDoc } from "../types/db";

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// 1. Define Validation Schema
const UpdateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(300).optional(),
  photoURL: z.string().url().optional().or(z.literal("")),
  privacy: z.object({
    showAge: z.boolean().optional(),
    showLocation: z.boolean().optional(),
    allowDMs: z.boolean().optional(),
  }).optional(),
  // PII fields should go to a private subcollection in a real app
});

export const updateProfile = functions.https.onCall(async (request) => {
  // 2. Auth Check
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be logged in to update profile."
    );
  }

  const { uid } = request.auth;

  // 3. Validation
  const parseResult = UpdateProfileSchema.safeParse(request.data);
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
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      throw new functions.https.HttpsError("not-found", "User profile not found.");
    }

    // 4. Update Document
    // Only update fields that were provided
    const updateData: Partial<UserDoc> = {
      updatedAt: now,
    };

    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.photoURL !== undefined) updateData.photoURL = data.photoURL || undefined; // Handle empty string clearing

    if (data.privacy) {
      // Need to merge with existing privacy settings or overwrite carefully
      // Since it's a map in Firestore, dot notation updates specific fields
      // But here we construct the object. Let's fetch current and merge.
      const currentData = userSnap.data() as UserDoc;
      updateData.privacy = {
        ...currentData.privacy,
        ...data.privacy,
      };
    }

    await userRef.update(updateData);

    // 5. Update Auth Profile (displayName/photoURL) for convenience
    if (data.displayName || data.photoURL) {
      await admin.auth().updateUser(uid, {
        displayName: data.displayName,
        photoURL: data.photoURL || null,
      });
    }

    return { success: true };

  } catch (error) {
    console.error("Error updating profile:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Unable to update profile.");
  }
});
