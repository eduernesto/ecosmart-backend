const crypto = require('crypto');

const HMAC_SECRET = process.env.HMAC_SECRET;
const TIME_WINDOW_S = 30;

function hmacAuth(req, res, next) {
  if (req.method !== 'POST') return next();

  const signature = req.headers['x-signature'];
  const timestamp = req.headers['x-timestamp'];

  if (!signature || !timestamp) {
    return res.status(401).json({ ok: false, error: 'Faltan headers de autenticación' });
  }

  const ts = parseInt(timestamp, 10);
  if (isNaN(ts) || Math.abs(Math.floor(Date.now() / 1000) - ts) > TIME_WINDOW_S) {
    return res.status(401).json({ ok: false, error: 'Timestamp inválido o expirado' });
  }

  const rawBody = JSON.stringify(req.body);
  const expected = crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(rawBody + timestamp)
    .digest('hex');

  if (signature !== expected) {
    return res.status(401).json({ ok: false, error: 'Firma inválida' });
  }

  next();
}

module.exports = hmacAuth;
