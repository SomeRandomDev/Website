module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { answers } = req.body;

  const utcTimestamp = new Date().toISOString();
  const localTimestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

  const entry = `\n--- ${localTimestamp} (${utcTimestamp}) ---\n${JSON.stringify(answers, null, 2)}\n`;

  const owner = 'SomeRandomDev';
  const repo = 'Website';
  const path = 'quiz-results.txt';
  const token = process.env.GITHUB_TOKEN;

  const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: `token ${token}` },
  });
  const fileData = await getRes.json();
  const currentContent = fileData.content
    ? Buffer.from(fileData.content, 'base64').toString('utf-8')
    : '';

  const newContent = currentContent + entry;

  await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `Quiz result ${utcTimestamp}`,
      content: Buffer.from(newContent).toString('base64'),
      sha: fileData.sha,
    }),
  });

  return res.status(200).json({ ok: true });
};