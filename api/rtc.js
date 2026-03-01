import pkg from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = pkg;


export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const APP_ID = process.env.APP_ID;
  const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

  if (!APP_ID || !APP_CERTIFICATE) {
    return res.status(500).json({ error: "Missing APP_ID / APP_CERTIFICATE" });
  }

  const channelName = String(req.query.channel || "").trim();
  const roleStr = String(req.query.role || "audience").trim(); // publisher|audience
  const uidStr = String(req.query.uid || "").trim();
  const expiry = Number(req.query.expiry || 3600);

  if (!channelName) return res.status(400).json({ error: "channel is required" });
  if (!uidStr) return res.status(400).json({ error: "uid is required" });

  const role = roleStr === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + Math.max(60, Math.min(expiry, 24 * 3600));

  const uid = Number(uidStr);
  if (!Number.isInteger(uid) || uid <= 0) {
    return res.status(400).json({ error: "uid must be a positive integer" });
  }

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );

  return res.status(200).json({ rtcToken: token, appId: APP_ID });
}
