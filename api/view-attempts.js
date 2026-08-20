const { createClient } = require('redis');

module.exports = async function handler(req, res) {
  const client = createClient({ url: process.env.REDIS_URL });
  await client.connect();
  const entries = await client.lRange('login-attempts', 0, -1);
  await client.quit();

  const parsed = entries.map(e => JSON.parse(e)).reverse(); // newest first

  const rows = parsed.map(entry => `
    <tr style="background: ${entry.result === 'SUCCESS' ? '#1a3a1a' : '#3a1a1a'};">
      <td style="padding: 8px; border: 1px solid #444;">${entry.time}</td>
      <td style="padding: 8px; border: 1px solid #444;">${entry.result}</td>
      <td style="padding: 8px; border: 1px solid #444;">${entry.answerTried || '-'}</td>
    </tr>
  `).join('');

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
    <html>
    <head><title>Login Attempts</title></head>
    <body style="font-family: sans-serif; background: #111; color: #eee; padding: 20px;">
      <h1>Login Attempts (${parsed.length})</h1>
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th style="padding: 8px; border: 1px solid #444; text-align: left;">Time</th>
            <th style="padding: 8px; border: 1px solid #444; text-align: left;">Result</th>
            <th style="padding: 8px; border: 1px solid #444; text-align: left;">Answer Tried</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
    </html>
  `);
};