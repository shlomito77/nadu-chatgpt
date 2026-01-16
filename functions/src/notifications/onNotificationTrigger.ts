import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions/v1";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const db = getFirestore();

// Trigger: When a new message is created in a chat
export const onMessageCreated = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const chatId = context.params.chatId;
    const senderUid = message.senderUid;

    if (!message || !chatId || !senderUid) return;

    try {
      // 1. Get Chat Participants
      const chatRef = db.collection('chats').doc(chatId);
      const chatSnap = await chatRef.get();
      const chatData = chatSnap.data();

      if (!chatData || !chatData.participants) return;

      // 2. Filter recipients (exclude sender)
      const recipients = chatData.participants.filter((uid: string) => uid !== senderUid);

      if (recipients.length === 0) return;

      // 3. Create Notification for each recipient
      const batch = db.batch();

      // Get Sender Profile for notification text
      const senderSnap = await db.collection('users').doc(senderUid).get();
      const senderName = senderSnap.data()?.displayName || 'מישהו';

      recipients.forEach((uid: string) => {
        const notifRef = db.collection('users').doc(uid).collection('notifications').doc();
        batch.set(notifRef, {
          id: notifRef.id,
          type: 'message',
          title: `הודעה חדשה מ-${senderName}`,
          body: message.text.substring(0, 50) + (message.text.length > 50 ? '...' : ''),
          link: `/chat/room?id=${chatId}`,
          isRead: false,
          createdAt: FieldValue.serverTimestamp()
        });
      });

      await batch.commit();
      logger.info(`Notifications sent for message in chat ${chatId}`);

    } catch (error) {
      logger.error('Error sending message notifications:', error);
    }
  });
