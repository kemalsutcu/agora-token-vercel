const { RtcTokenBuilder, RtcRole } = require('agora-token');

module.exports = async function handler(req, res) {
  try {
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return res.status(500).json({
        ok: false,
        error: 'AGORA_APP_ID veya AGORA_APP_CERTIFICATE eksik'
      });
    }

    const channelName = String(req.query.channel || '').trim();
    const roleText = String(req.query.role || 'audience').trim().toLowerCase();
    const uid = Number(req.query.uid || 0);
    const expiry = Math.min(86400, Math.max(60, Number(req.query.expiry || 3600)));

    if (!channelName) {
      return res.status(400).json({ ok: false, error: 'channel gerekli' });
    }

    if (!Number.isInteger(uid) || uid <= 0) {
      return res.status(400).json({ ok: false, error: 'uid pozitif integer olmalı' });
    }

    const role = roleText === 'publisher' || roleText === 'host'
      ? RtcRole.PUBLISHER
      : RtcRole.SUBSCRIBER;

    const expireAt = Math.floor(Date.now() / 1000) + expiry;
    const rtcToken = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      expireAt
    );

    return res.status(200).json({
      ok: true,
      appId,
      rtcToken,
      channelName,
      uid,
      expireAt
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error?.message || String(error)
    });
  }
};
