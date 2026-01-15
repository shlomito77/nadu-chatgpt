import * as logger from "firebase-functions/logger";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
// Explicitly import v1 for auth triggers
import * as functions from "firebase-functions/v1";

const db = getFirestore();
const auth = getAuth();

// Trigger when a new Auth user is created
// Type the user object implicitly or explicitly if available from 'firebase-functions/v1'
export const onUserCreate = functions.auth.user().onCreate(async (user: functions.auth.UserRecord) => {
  const uid = user.uid;
  const email = user.email;
  const displayName = user.displayName || user.email?.split("@")[0] || "User";
  const photoURL = user.photoURL || null;

  logger.info(`Creating user profile for ${uid} (${email})`);

  try {
    // 1. Set Custom Claims
    await auth.setCustomUserClaims(uid, {
      role: "user",
      verified: false,
      tenureDays: 0,
    });

    // 2. Create User Document
    const userDoc = {
      uid,
      email: email || "",
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

    await db.collection("users").doc(uid).set(userDoc);
    logger.info(`User profile created for ${uid}`);

  } catch (error) {
    logger.error(`Error creating user profile for ${uid}`, error);
  }
});
