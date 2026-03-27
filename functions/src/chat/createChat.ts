import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { z } from "zod";

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// 1. Validation Schema
const CreateChatSchema = z.object({
  targetUid: z.string().min(1),
});

export const createChat = functions.https.onCall(async (request) => {
  // 2. Auth Check
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be logged in to message."
    );
  }

  const { uid } = request.auth;
  const parseResult = CreateChatSchema.safeParse(request.data);

  if (!parseResult.success) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid data.",
      parseResult.error.flatten()
    );
  }

  const { targetUid } = parseResult.data;

  if (uid === targetUid) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Cannot chat with yourself."
    );
  }

  try {
    // 3. Check for existing chat (Basic Check: Array Contains)
    // Firestore limitation: cannot query array-contains for multiple values easily without specific structure or composite index hacks.
    // For MVP: We query chats where user is participant, then filter in code (or use a deterministic ID like min(uid1, uid2)_max(uid1, uid2)).

    // Deterministic ID approach prevents duplicates easily
    const chatId = [uid, targetUid].sort().join("_");
    const chatRef = db.collection("chats").doc(chatId);
    const chatSnap = await chatRef.get();

    if (chatSnap.exists) {
      return { chatId, isNew: false };
    }

    // 4. Create new chat if not exists
    const now = admin.firestore.Timestamp.now();

    // Fetch target user info for denormalization (optional but helpful for list view)
    const targetSnap = await db.collection("users").doc(targetUid).get();
    if (!targetSnap.exists) {
       throw new functions.https.HttpsError("not-found", "Target user not found.");
    }

    const newChat = {
      id: chatId,
      type: 'dm',
      participants: [uid, targetUid],
      participantData: { // Map for quick lookup in list view
         [uid]: { active: true },
         [targetUid]: { active: true }
      },
      lastMessage: null,
      createdAt: now,
      updatedAt: now,
    };

    await chatRef.set(newChat);

    return { chatId, isNew: true };

  } catch (error) {
    console.error("Error creating chat:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Unable to create chat.");
  }
});
