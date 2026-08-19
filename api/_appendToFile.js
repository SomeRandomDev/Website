module.exports = async function appendToFile(entryText) {
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

  const newContent = currentContent + entryText;

  await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `Log entry ${new Date().toISOString()}`,
      content: Buffer.from(newContent).toString('base64'),
      sha: fileData.sha,
    }),
  });
};