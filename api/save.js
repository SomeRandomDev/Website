const REPO_OWNER = 'SomeRandomDev';
const REPO_NAME  = 'Website';
const BRANCH     = 'main';
const FILE_PATH  = 'entries.json';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-password');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── Debug: show what we received vs what we expect ──
  const received = req.headers['x-password'];
  const expected = process.env.WRITE_PASSWORD;

  if (req.method === 'GET' && req.query.debug === '1') {
    return res.status(200).json({
      received_header: received ?? 'undefined',
      env_set: expected !== undefined,
      env_length: expected?.length ?? 0,
      match: received === expected,
    });
  }

  if (received !== expected) {
    return res.status(401).json({ error: 'Wrong password' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'GitHub token not configured' });

  const apiBase = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };

  if (req.method === 'GET') {
    try {
      const r = await fetch(`${apiBase}?ref=${BRANCH}`, { headers });
      if (r.status === 404) return res.status(200).json({ entries: [], sha: null });
      const data = await r.json();
      const entries = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
      return res.status(200).json({ entries, sha: data.sha });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { entries, sha } = req.body;
      const content = Buffer.from(JSON.stringify(entries, null, 2), 'utf8').toString('base64');
      const body = {
        message: `diary: update entries`,
        content,
        branch: BRANCH,
        ...(sha ? { sha } : {}),
      };
      const r = await fetch(apiBase, { method: 'PUT', headers, body: JSON.stringify(body) });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json({ error: data.message });
      return res.status(200).json({ ok: true, sha: data.content.sha });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
