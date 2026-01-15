import { setGlobalOptions } from "firebase-functions/v2";
import { initializeApp } from "firebase-admin/app";

// Ensure Admin SDK is initialized exactly once.
initializeApp();

setGlobalOptions({
  region: "us-central1",
});

// --- Auth Triggers ---
export { onUserCreate } from "./auth/onUserCreate";

// --- User Functions ---
export { updateProfile } from "./user/updateProfile";

// --- Post Functions ---
export { createPost } from "./post/createPost";

// --- Chat Functions ---
// Export the new v2 callable functions, NOT the old v1/http/onRequest ones from the original template
export { sendMessage } from "./chat/sendMessage";
export { createDM } from "./chat/createChat";

// --- Event Functions ---
export { createEvent } from "./event/createEvent";
export { rsvpEvent } from "./event/rsvpEvent";
