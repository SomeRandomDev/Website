import { SignJWT } from 'jose';

function normalize(str) {
  return str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default async function handler(req, res) {
  // GET: just returns the question text for gate.html to display
  if (req.method === 'GET') {
    return res.status(200).json({ question: process.env.SITE_QUESTION });
  }

  if (req.method === 'POST') {
    const { answer } = req.body;

    if (normalize(answer || '') !== normalize(process.env.SITE_ANSWER)) {
      return res.status(401).json({ ok: false });
    }

    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const token = await new SignJWT({ ok: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('90d')
      .sign(secret);

    res.setHeader(
      'Set-Cookie',
      `session=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 90}; Path=/`
    );
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}