const { createClient } = require('redis');

let client;

async function getClient() {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => console.error('Redis error:', err));
    await client.connect();
  }
  return client;
}

module.exports = async function logAttempt(entry) {
  const redis = await getClient();
  await redis.rPush('login-attempts', JSON.stringify(entry));
};