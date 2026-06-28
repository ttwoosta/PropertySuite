import { setGlobalOptions } from "firebase-functions";
import { onRequest, onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import twilio from "twilio";

setGlobalOptions({ maxInstances: 10 });

admin.initializeApp();

const db = admin.firestore();

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new HttpsError(
      "failed-precondition",
      "Twilio credentials are not configured."
    );
  }
  return twilio(accountSid, authToken);
}

/**
 * sendSms — callable function.
 * Body: { to: string, body: string, mediaUrl?: string }
 * Requires the caller to be authenticated.
 */
export const sendSms = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be signed in to send SMS.");
  }

  const { to, body, mediaUrl } = request.data as {
    to: string;
    body: string;
    mediaUrl?: string;
  };

  if (!to || !body) {
    throw new HttpsError("invalid-argument", "Fields 'to' and 'body' are required.");
  }

  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) {
    throw new HttpsError(
      "failed-precondition",
      "TWILIO_PHONE_NUMBER is not configured."
    );
  }

  const client = getTwilioClient();

  const message = await client.messages.create({
    to,
    from,
    body,
    ...(mediaUrl ? { mediaUrl: [mediaUrl] } : {}),
  });

  logger.info("SMS sent", { sid: message.sid, to, uid: request.auth.uid });

  await db.collection("sms_messages").add({
    direction: "outbound",
    to,
    from,
    body,
    mediaUrl: mediaUrl ?? null,
    sid: message.sid,
    status: message.status,
    uid: request.auth.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { sid: message.sid, status: message.status };
});

/**
 * receiveSms — HTTP webhook for Twilio inbound messages.
 * Configure this URL in the Twilio console under your phone number's
 * "A MESSAGE COMES IN" webhook: POST https://<region>-<project>.cloudfunctions.net/receiveSms
 *
 * Twilio sends: From, To, Body, NumMedia, MediaUrl0…MediaUrl9
 */
export const receiveSms = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { From, To, Body, NumMedia } = req.body as {
    From: string;
    To: string;
    Body: string;
    NumMedia: string;
  };

  const mediaUrls: string[] = [];
  const count = parseInt(NumMedia ?? "0", 10);
  for (let i = 0; i < count; i++) {
    const url = (req.body as Record<string, string>)[`MediaUrl${i}`];
    if (url) mediaUrls.push(url);
  }

  logger.info("Inbound SMS", { from: From, to: To, body: Body });

  await db.collection("sms_messages").add({
    direction: "inbound",
    from: From,
    to: To,
    body: Body,
    mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Reply with empty TwiML to acknowledge receipt
  res.setHeader("Content-Type", "text/xml");
  res.status(200).send("<Response></Response>");
});
