import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import * as logger from "firebase-functions/logger";

import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Ensure Admin SDK is initialized exactly once.
initializeApp();

setGlobalOptions({
  region: "us-central1",
});

// --- Auth Triggers ---
export { onUserCreate } from "./auth/onUserCreate";

// --- User Functions ---
export { updateProfile } from "./user/updateProfile";

// --- Helpers ---
function json(res: any, status: number, body: any) {
  res.status(status).set("Content-Type", "application/json").send(JSON.stringify(body));
}

async function requireIdToken(req: any): Promise<{ uid: string }> {
  const authHeader = req.get("Authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new Error("MISSING_AUTH_HEADER");

  const idToken = match[1];
  const decoded = await getAuth().verifyIdToken(idToken);
  if (!decoded?.uid) throw new Error("INVALID_TOKEN");

  return { uid: decoded.uid };
}

function requirePost(req: any) {
  if (req.method !== "POST") throw new Error("METHOD_NOT_ALLOWED");
}

function requireBody(req: any): any {
  const body = req.body;
  if (!body || typeof body !== "object") throw new Error("MISSING_BODY");
  return body;
}

function asString(x: any): string | null {
  return typeof x === "string" ? x : null;
}

function asStringArray(x: any): string[] | null {
  if (!Array.isArray(x)) return null;
  if (!x.every((v) => typeof v === "string" && v.length > 0)) return null;
  return x;
}

// --- Functions ---

/**
 * createChat
 * Input:
 *   { type: "dm" | "group", memberUids: string[], title?: string }
 *
 * Behavior (A-confirmed):
 *   Always creates:
 *   chats/{chatId}
 *   chats/{chatId}/members/{uid} for each member, including caller
 */
export const createChat = onRequest(async (req, res) => {
  try {
    requirePost(req);

    const { uid } = await requireIdToken(req);
    const body = requireBody(req);

    const type = asString(body.type);
    const memberUids = asStringArray(body.memberUids);
    const title = asString(body.title);

    if (type !== "dm" && type !== "group") {
      return json(res, 400, { ok: false, error: "BAD_REQUEST", message: "type must be 'dm' or 'group'" });
    }
    if (!memberUids || memberUids.length < 2) {
      return json(res, 400, { ok: false, error: "BAD_REQUEST", message: "memberUids must contain at least 2 uids" });
    }

    // Ensure caller is included (A behavior).
    const uniq = new Set<string>(memberUids);
    uniq.add(uid);
    const members = Array.from(uniq);

    // Optional: For DM enforce exactly 2 unique members
    if (type === "dm" && members.length !== 2) {
      return json(res, 400, { ok: false, error: "BAD_REQUEST", message: "dm must have exactly 2 unique members" });
    }

    const db = getFirestore();
    const chatRef = db.collection("chats").doc(); // auto-id
    const chatId = chatRef.id;

    const now = FieldValue.serverTimestamp();

    // One batch commit = no partial "chat created but no members".
    const batch = db.batch();

    batch.set(chatRef, {
      type,
      createdBy: uid,
      createdAt: now,
      updatedAt: now,
      ...(type === "group" && title ? { title } : {}),
      // (Optional) handy for queries; still keep /members as source of truth
      memberUids: members,
    });

    for (const m of members) {
      const mRef = chatRef.collection("members").doc(m);
      batch.set(mRef, {
        uid: m,
        joinedAt: now,
        addedBy: uid,
      });
    }

    await batch.commit();

    logger.info("createChat ok", { chatId, type, createdBy: uid, membersCount: members.length });
    return json(res, 200, { ok: true, chatId, members });
  } catch (e: any) {
    const msg = String(e?.message || e);

    if (msg === "METHOD_NOT_ALLOWED") return json(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
    if (msg === "MISSING_AUTH_HEADER") return json(res, 401, { ok: false, error: "UNAUTHENTICATED" });
    if (msg === "INVALID_TOKEN") return json(res, 401, { ok: false, error: "UNAUTHENTICATED" });
    if (msg === "MISSING_BODY") return json(res, 400, { ok: false, error: "BAD_REQUEST", message: "missing JSON body" });

    logger.error("createChat INTERNAL", { error: msg, stack: e?.stack });
    return json(res, 500, { ok: false, error: "INTERNAL", message: msg });
  }
});

/**
 * sendMessage
 * Input:
 *   { chatId: string, text: string }
 *
 * Server checks:
 *   caller must be a member at chats/{chatId}/members/{uid}
 */
export const sendMessage = onRequest(async (req, res) => {
  try {
    requirePost(req);

    const { uid } = await requireIdToken(req);
    const body = requireBody(req);

    const chatId = asString(body.chatId);
    const text = asString(body.text);

    if (!chatId) {
      return json(res, 400, { ok: false, error: "BAD_REQUEST", message: "chatId is required" });
    }
    if (!text || text.trim().length === 0) {
      return json(res, 400, { ok: false, error: "BAD_REQUEST", message: "text is required" });
    }
    if (text.length > 8000) {
      return json(res, 400, { ok: false, error: "BAD_REQUEST", message: "text too long (max 8000)" });
    }

    const db = getFirestore();
    const chatRef = db.collection("chats").doc(chatId);

    // membership check
    const memberRef = chatRef.collection("members").doc(uid);
    const memberSnap = await memberRef.get();
    if (!memberSnap.exists) {
      return json(res, 403, { ok: false, error: "FORBIDDEN", message: "not a chat member" });
    }

    const now = FieldValue.serverTimestamp();
    const msgRef = chatRef.collection("messages").doc(); // auto-id

    const batch = db.batch();

    batch.set(msgRef, {
      senderId: uid,
      text,
      createdAt: now,
    });

    // update chat metadata (safe / useful for list rendering later)
    batch.update(chatRef, {
      updatedAt: now,
      lastMessageText: text.slice(0, 200),
      lastMessageBy: uid,
    });

    await batch.commit();

    logger.info("sendMessage ok", { chatId, messageId: msgRef.id, senderId: uid });
    return json(res, 200, { ok: true, chatId, messageId: msgRef.id });
  } catch (e: any) {
    const msg = String(e?.message || e);

    if (msg === "METHOD_NOT_ALLOWED") return json(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
    if (msg === "MISSING_AUTH_HEADER") return json(res, 401, { ok: false, error: "UNAUTHENTICATED" });
    if (msg === "INVALID_TOKEN") return json(res, 401, { ok: false, error: "UNAUTHENTICATED" });
    if (msg === "MISSING_BODY") return json(res, 400, { ok: false, error: "BAD_REQUEST", message: "missing JSON body" });

    logger.error("sendMessage INTERNAL", { error: msg, stack: e?.stack });
    return json(res, 500, { ok: false, error: "INTERNAL", message: msg });
  }
});
