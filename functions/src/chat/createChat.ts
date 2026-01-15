import * as logger from "firebase-functions/logger";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const db = getFirestore();

interface CreateDMRequest {
  targetUid: string;
}

export const createDM = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }

  const uid = request.auth.uid;
  const targetUid = (request.data as CreateDMRequest).targetUid;

  if (uid === targetUid) {
    throw new HttpsError('invalid-argument', 'Cannot chat with yourself');
  }

  // 1. Check for existing DM
  // Deterministic ID for 1:1 chats: sort(uid1, uid2)
  const sortedUids = [uid, targetUid].sort();
  const chatId = `dm_${sortedUids[0]}_${sortedUids[1]}`;

  const chatRef = db.collection('chats').doc(chatId);
  const chatSnap = await chatRef.get();

  if (chatSnap.exists) {
    return { chatId, isNew: false };
  }

  try {
    // 2. Fetch target user to get username (for UI cache)
    const targetUserSnap = await db.collection('users').doc(targetUid).get();
    if (!targetUserSnap.exists) {
      throw new HttpsError('not-found', 'Target user not found');
    }

    // 3. Create Chat
    await chatRef.set({
      chatId,
      type: 'dm',
      participants: [uid, targetUid],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastMessage: null
    });

    // 4. Add Members subcollection (for strict security rules logic)
    const batch = db.batch();
    batch.set(chatRef.collection('members').doc(uid), {
      uid,
      role: 'member',
      joinedAt: FieldValue.serverTimestamp()
    });
    batch.set(chatRef.collection('members').doc(targetUid), {
      uid: targetUid,
      role: 'member',
      joinedAt: FieldValue.serverTimestamp()
    });

    await batch.commit();

    return { chatId, isNew: true };

  } catch (error) {
    logger.error(`Error creating DM between ${uid} and ${targetUid}`, error);
    throw new HttpsError('internal', 'Failed to create DM');
  }
});
