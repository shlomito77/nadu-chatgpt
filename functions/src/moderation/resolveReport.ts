import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { z } from "zod";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const ResolveReportSchema = z.object({
  reportId: z.string().min(1),
  action: z.enum(['dismiss', 'ban_user', 'delete_content', 'warn']),
  notes: z.string().optional(),
});

export const resolveReport = functions.https.onCall(async (request) => {
  // 1. Admin Auth Check
  if (!request.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in.");
  }

  // Check custom claims for role
  const { token } = request.auth;
  if (token.role !== 'admin' && token.role !== 'moderator') {
    throw new functions.https.HttpsError("permission-denied", "Must be an admin or moderator.");
  }

  const parseResult = ResolveReportSchema.safeParse(request.data);
  if (!parseResult.success) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid data.", parseResult.error.flatten());
  }

  const { reportId, action, notes } = parseResult.data;
  const now = admin.firestore.Timestamp.now();

  try {
    const reportRef = db.collection("reports").doc(reportId);
    const reportSnap = await reportRef.get();

    if (!reportSnap.exists) {
      throw new functions.https.HttpsError("not-found", "Report not found.");
    }

    const reportData = reportSnap.data();

    // 2. Perform Action (Simplified for MVP)
    if (action === 'delete_content') {
       if (reportData?.targetRef) {
         await db.doc(reportData.targetRef).delete();
       }
    } else if (action === 'ban_user') {
       // Ideally update auth and user doc
       if (reportData?.targetType === 'user') {
         await admin.auth().updateUser(reportData.targetId, { disabled: true });
         await db.collection("users").doc(reportData.targetId).update({ "flags.isBanned": true });
       }
    }

    // 3. Update Report Status
    await reportRef.update({
      status: 'resolved',
      resolution: {
        action,
        moderatorUid: request.auth.uid,
        resolvedAt: now,
        notes: notes || ""
      },
      updatedAt: now
    });

    // 4. Log to Audit Trail
    await db.collection("moderationActions").add({
      actorUid: request.auth.uid,
      actorRole: token.role,
      actionType: action,
      targetType: reportData?.targetType,
      targetId: reportData?.targetId,
      reason: notes || "Report resolution",
      reportId,
      createdAt: now
    });

    return { success: true };

  } catch (error) {
    console.error("Error resolving report:", error);
    throw new functions.https.HttpsError("internal", "Unable to resolve report.");
  }
});
