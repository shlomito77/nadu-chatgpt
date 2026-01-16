import * as logger from "firebase-functions/logger";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const db = getFirestore();
const auth = getAuth();

interface ResolveReportRequest {
  reportId: string;
  action: 'dismiss' | 'ban_user' | 'delete_content';
  notes?: string;
}

export const resolveReport = onCall(async (request) => {
  // 1. Admin Check
  if (!request.auth || request.auth.token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Admin only');
  }

  const adminUid = request.auth.uid;
  const data = request.data as ResolveReportRequest;

  if (!data.reportId || !data.action) {
    throw new HttpsError('invalid-argument', 'Missing fields');
  }

  try {
    const reportRef = db.collection('reports').doc(data.reportId);
    const reportSnap = await reportRef.get();

    if (!reportSnap.exists) {
      throw new HttpsError('not-found', 'Report not found');
    }

    const reportData = reportSnap.data();
    const targetId = reportData?.targetId;
    const targetType = reportData?.targetType;

    // 2. Perform Action
    const batch = db.batch();

    // Update Report Status
    batch.update(reportRef, {
      status: 'resolved',
      resolution: data.action,
      adminNotes: data.notes || '',
      resolvedBy: adminUid,
      resolvedAt: FieldValue.serverTimestamp()
    });

    // Execute Moderation
    if (data.action === 'delete_content') {
      if (targetType === 'post') {
        batch.delete(db.collection('posts').doc(targetId));
      } else if (targetType === 'comment') {
        // Need parent post ID ideally, or recursive delete.
        // For MVP assuming direct access or manual cleanup.
        // If targetType is comment, we might need path.
        // Let's assume global comments collection or we fail for now.
        // Actually, deleting nested subcollections requires recursive delete tools.
        // Simply marking as 'deleted' status is safer.
        if (targetType === 'post') {
           batch.update(db.collection('posts').doc(targetId), { status: 'deleted', visibility: 'removed' });
        }
      }
    } else if (data.action === 'ban_user') {
      // Ban user in Auth
      if (targetType === 'user') {
        await auth.updateUser(targetId, { disabled: true });
        // Mark in Firestore
        batch.update(db.collection('users').doc(targetId), {
          'flags.banned': true,
          'flags.bannedAt': FieldValue.serverTimestamp()
        });
      }
    }

    await batch.commit();
    logger.info(`Report ${data.reportId} resolved with ${data.action} by ${adminUid}`);

    return { success: true };

  } catch (error) {
    logger.error('Error resolving report:', error);
    throw new HttpsError('internal', 'Failed to resolve report');
  }
});
