import * as logger from "firebase-functions/logger";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const db = getFirestore();

interface CreateEventRequest {
  title: string;
  description: string;
  date: string; // ISO string
  location: string;
  maxAttendees?: number;
}

export const createEvent = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }

  const uid = request.auth.uid;
  const data = request.data as CreateEventRequest;

  // 1. Validation
  if (!data.title || data.title.length < 3) {
    throw new HttpsError('invalid-argument', 'Title too short');
  }
  if (!data.date) {
    throw new HttpsError('invalid-argument', 'Date is required');
  }

  const eventDate = new Date(data.date);
  if (eventDate < new Date()) {
    throw new HttpsError('invalid-argument', 'Event cannot be in the past');
  }

  try {
    // 2. Fetch Host Profile
    const userSnap = await db.collection('users').doc(uid).get();
    const userData = userSnap.data();

    // 3. Create Event
    const eventRef = db.collection('events').doc();
    const eventId = eventRef.id;

    await eventRef.set({
      eventId,
      hostUid: uid,
      hostDisplayName: userData?.displayName || 'Unknown',

      title: data.title,
      description: data.description || '',
      date: eventDate,
      location: data.location || 'TBD',
      maxAttendees: data.maxAttendees || 0, // 0 = unlimited

      attendeesCount: 1, // Host is attending

      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    // 4. Add Host as Attendee
    await eventRef.collection('rsvps').doc(uid).set({
      uid,
      status: 'going',
      timestamp: FieldValue.serverTimestamp()
    });

    return { success: true, eventId };

  } catch (error) {
    logger.error(`Error creating event by ${uid}`, error);
    throw new HttpsError('internal', 'Failed to create event');
  }
});
