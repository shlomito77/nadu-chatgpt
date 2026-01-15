import * as logger from "firebase-functions/logger";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const db = getFirestore();

interface SendMessageRequest {
  chatId: string;
  text: string;
}

export const sendMessage = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }

  const uid = request.auth.uid;
  const data = request.data as SendMessageRequest;
  const chatId = data.chatId;

  // 1. Validation
  if (!data.text || data.text.trim().length === 0) {
    throw new HttpsError('invalid-argument', 'Message text cannot be empty');
  }

  if (data.text.length > 2000) {
    throw new HttpsError('invalid-argument', 'Message too long (max 2000 chars)');
  }

  // 2. Membership Check
  const chatRef = db.collection('chats').doc(chatId);

  // Optimization: In a real app, we might check a denormalized 'participants' array on the chat doc
  // But strictly per specs, we check subcollection membership if privacy is extreme
  // However, for performance, checking the doc is better.
  // Let's assume the chat doc has 'participants' array as per Data Model spec.

  const chatSnap = await chatRef.get();
  if (!chatSnap.exists) {
    throw new HttpsError('not-found', 'Chat not found');
  }

  const chatData = chatSnap.data();
  if (chatData?.type !== 'lobby' && !chatData?.participants?.includes(uid)) {
     throw new HttpsError('permission-denied', 'You are not a member of this chat');
  }

  try {
    const batch = db.batch();
    const messageRef = chatRef.collection('messages').doc();

    // 3. Create Message
    batch.set(messageRef, {
      messageId: messageRef.id,
      chatId,
      senderUid: uid,
      text: data.text,
      status: 'active',
      createdAt: FieldValue.serverTimestamp()
    });

    // 4. Update Chat Metadata (Last Message)
    batch.update(chatRef, {
      lastMessage: {
        text: data.text.slice(0, 100),
        senderUid: uid,
        timestamp: FieldValue.serverTimestamp()
      },
      lastMessageAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    await batch.commit();
    return { success: true, messageId: messageRef.id };

  } catch (error) {
    logger.error(`Error sending message in ${chatId}`, error);
    throw new HttpsError('internal', 'Failed to send message');
  }
});
