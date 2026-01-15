import * as logger from "firebase-functions/logger";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
// Explicitly import v1 for auth triggers
import * as functions from "firebase-functions/v1";

const db = getFirestore();
const auth = getAuth();

// Trigger when a new Auth user is created
export const onUserCreate = functions.auth.user().onCreate(async (user: functions.auth.UserRecord) => {
  const uid = user.uid;
  const email = user.email; // We use this for logging/internal logic but DO NOT save to public doc
  const displayName = user.displayName || user.email?.split("@")[0] || "User";
  const photoURL = user.photoURL || null;

  logger.info(`Creating user profile for ${uid}`);

  try {
    // 1. Set Custom Claims
    await auth.setCustomUserClaims(uid, {
      role: "user",
      verified: false,
      tenureDays: 0,
    });

    // 2. Create User Document (PUBLIC)
    // IMPORTANT: Do NOT store PII (email, phone, real name) here.
    const userDoc = {
      uid,
      // email: email || "", // REMOVED FOR PRIVACY
      username: displayName.toLowerCase().replace(/\s+/g, "_"),
      displayName,
      photoURL,

      sex: "other",
      dob: null,
      age: 0,

      role: "other",
      orientation: "other",
      bio: "",
      interests: [],

      roles: {
        admin: false,
        moderator: false,
        verified: false,
        premium: false
      },

      online: false,
      lastSeen: FieldValue.serverTimestamp(),
      tenureDays: 0,

      privacy: {
        showCity: false,
        allowDMs: true,
        showOnlineStatus: true
      },

      stats: {
        posts: 0,
        comments: 0,
        likes: 0
      },

      flags: {
        banned: false,
        shadowBanned: false,
        reported: false
      },

      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    // 3. Create Private Document (PRIVATE - Admin/Owner only)
    // Store sensitive PII here if needed, protected by strict rules.
    const privateDoc = {
      email: email || "",
      uid,
      createdAt: FieldValue.serverTimestamp()
    };

    const batch = db.batch();
    batch.set(db.collection("users").doc(uid), userDoc);
    batch.set(db.collection("users").doc(uid).collection("private").doc("profile"), privateDoc);

    await batch.commit();
    logger.info(`User profile created for ${uid}`);

  } catch (error) {
    logger.error(`Error creating user profile for ${uid}`, error);
  }
});
