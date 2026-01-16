import * as logger from "firebase-functions/logger";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const db = getFirestore();

interface CreateReportRequest {
  targetId: string;
  targetType: 'post' | 'user' | 'comment';
  reason: string;
  description?: string;
}

export const createReport = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }

  const uid = request.auth.uid;
  const data = request.data as CreateReportRequest;

  // 1. Validation
  if (!data.targetId || !data.targetType || !data.reason) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  // Rate Limiting (Basic): Check if user reported recently?
  // Skipping for MVP, but good to note.

  try {
    const reportRef = db.collection('reports').doc();

    await reportRef.set({
      reportId: reportRef.id,
      reporterUid: uid,
      targetId: data.targetId,
      targetType: data.targetType,
      reason: data.reason,
      description: data.description || '',
      status: 'open',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    // Optional: Flag the content immediately if trust score is high?
    // For now, just log.
    logger.info(`Report created by ${uid} on ${data.targetType}:${data.targetId}`);

    return { success: true, reportId: reportRef.id };

  } catch (error) {
    logger.error('Error creating report:', error);
    throw new HttpsError('internal', 'Failed to submit report');
  }
});
