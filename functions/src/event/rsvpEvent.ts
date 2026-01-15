import * as logger from "firebase-functions/logger";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const db = getFirestore();

interface RsvpRequest {
  eventId: string;
  status: 'going' | 'maybe' | 'not_going';
}

export const rsvpEvent = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }

  const uid = request.auth.uid;
  const data = request.data as RsvpRequest;
  const { eventId, status } = data;

  if (!eventId || !status) {
    throw new HttpsError('invalid-argument', 'Missing fields');
  }

  const eventRef = db.collection('events').doc(eventId);

  try {
    await db.runTransaction(async (transaction) => {
      const eventSnap = await transaction.get(eventRef);
      if (!eventSnap.exists) {
        throw new HttpsError('not-found', 'Event not found');
      }

      const eventData = eventSnap.data();
      const rsvpRef = eventRef.collection('rsvps').doc(uid);
      const rsvpSnap = await transaction.get(rsvpRef);
      const oldStatus = rsvpSnap.exists ? rsvpSnap.data()?.status : 'not_going';

      // Check capacity if joining
      if (status === 'going' && oldStatus !== 'going') {
        if (eventData?.maxAttendees > 0 && eventData?.attendeesCount >= eventData?.maxAttendees) {
          throw new HttpsError('resource-exhausted', 'Event is full');
        }
      }

      // Update RSVP
      transaction.set(rsvpRef, {
        uid,
        status,
        timestamp: FieldValue.serverTimestamp()
      });

      // Update Counter
      let increment = 0;
      if (status === 'going' && oldStatus !== 'going') increment = 1;
      if (status !== 'going' && oldStatus === 'going') increment = -1;

      if (increment !== 0) {
        transaction.update(eventRef, {
          attendeesCount: FieldValue.increment(increment)
        });
      }
    });

    return { success: true };

  } catch (error) {
    logger.error(`Error RSVP event ${eventId}`, error);
    throw error instanceof HttpsError ? error : new HttpsError('internal', 'Failed to RSVP');
  }
});
