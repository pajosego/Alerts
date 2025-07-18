const { monitor } = require('./monitor');

const CHAT_ID = process.env.CHAT_ID;

async function start() {
  await monitor(CHAT_ID);
  setInterval(() => monitor(CHAT_ID), 10 * 60 * 1000);
  // Evita encerramento automático no Railway
  process.stdin.resume();
}

start();
