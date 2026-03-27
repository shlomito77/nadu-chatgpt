import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";
import {UserDoc} from "../types/db";

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const {uid, email, displayName, photoURL} = user;

  const now = admin.firestore.Timestamp.now();

  const newUser: UserDoc = {
    uid,
    email: email || "",
    displayName: displayName || "Anonymous",
    photoURL: photoURL || undefined,
    bio: "",
    dob: "", // User must fill this later
    age: 0,
    privacy: {
      showAge: false,
      showLocation: false,
      allowDMs: true,
    },
    isVerified: false,
    role: "user",
    flags: {
      isBanned: false,
      isShadowBanned: false,
    },
    createdAt: now,
    updatedAt: now,
  };

  try {
    // 1. Create the user document
    await db.collection("users").doc(uid).set(newUser);

    // 2. Set custom claims
    await admin.auth().setCustomUserClaims(uid, {
      role: "user",
      isVerified: false,
    });

    console.log(`User created: ${uid}`);
  } catch (error) {
    console.error("Error creating user document:", error);
    // Note: We don't throw here to avoid retrying endlessly if it's a permanent error
  }
});
