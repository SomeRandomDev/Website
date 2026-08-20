const { createClient } = require('redis');

module.exports = async function handler(req, res) {
  const client = createClient({ url: process.env.REDIS_URL });
  await client.connect();
  const entries = await client.lRange('login-attempts', 0, -1);
  await client.quit();

  const parsed = entries.map(e => JSON.parse(e));
  res.status(200).json(parsed);
};