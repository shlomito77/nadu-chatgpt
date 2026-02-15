import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { z } from "zod";

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// 1. Validation Schema
const SendMessageSchema = z.object({
  chatId: z.string().min(1),
  content: z.string().min(1).max(2000),
  type: z.enum(['text', 'image']).optional().default('text'),
});

export const sendMessage = functions.https.onCall(async (request) => {
  // 2. Auth Check
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be logged in to send message."
    );
  }

  const { uid } = request.auth;
  const parseResult = SendMessageSchema.safeParse(request.data);

  if (!parseResult.success) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid data.",
      parseResult.error.flatten()
    );
  }

  const { chatId, content, type } = parseResult.data;
  const now = admin.firestore.Timestamp.now();

  try {
    const chatRef = db.collection("chats").doc(chatId);
    const chatSnap = await chatRef.get();

    if (!chatSnap.exists) {
      throw new functions.https.HttpsError("not-found", "Chat not found.");
    }

    const chatData = chatSnap.data();

    // 3. Verify Membership
    if (!chatData?.participants?.includes(uid)) {
      throw new functions.https.HttpsError("permission-denied", "Not a participant in this chat.");
    }

    // 4. Create Message
    const messageRef = chatRef.collection("messages").doc();
    const newMessage = {
      id: messageRef.id,
      chatId,
      senderUid: uid,
      content,
      type,
      createdAt: now,
    };

    // 5. Transaction: Add message + update parent lastMessage
    await db.runTransaction(async (transaction) => {
      transaction.set(messageRef, newMessage);
      transaction.update(chatRef, {
        lastMessage: {
          content: type === 'image' ? '📷 Image' : content,
          senderUid: uid,
          sentAt: now,
          type
        },
        updatedAt: now
      });
    });

    return { messageId: messageRef.id, success: true };

  } catch (error) {
    console.error("Error sending message:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Unable to send message.");
  }
});
