import * as logger from "firebase-functions/logger";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const db = getFirestore();

interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  role?: string;
}

export const updateProfile = onCall(async (request) => {
  // 1. Auth Check
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }

  const uid = request.auth.uid;
  const data = request.data as UpdateProfileRequest;

  logger.info(`Updating profile for ${uid}`, data);

  // 2. Validation
  if (data.displayName && (data.displayName.length < 2 || data.displayName.length > 50)) {
    throw new HttpsError('invalid-argument', 'Display name must be between 2 and 50 characters');
  }

  if (data.bio && data.bio.length > 1000) {
    throw new HttpsError('invalid-argument', 'Bio must be under 1000 characters');
  }

  const allowedRoles = ['dom', 'sub', 'switch', 'curious', 'other'];
  if (data.role && !allowedRoles.includes(data.role)) {
    throw new HttpsError('invalid-argument', 'Invalid role');
  }

  try {
    // 3. Update Firestore
    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp()
    };

    if (data.displayName) updateData.displayName = data.displayName;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.role) updateData.role = data.role;

    await db.collection('users').doc(uid).update(updateData);

    logger.info(`Profile updated for ${uid}`);
    return { success: true };

  } catch (error) {
    logger.error(`Error updating profile for ${uid}`, error);
    throw new HttpsError('internal', 'Failed to update profile');
  }
});
