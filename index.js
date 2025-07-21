const { monitor } = require('./monitor');

const CHAT_ID = process.env.CHAT_ID;

async function start() {
  await monitor(CHAT_ID);
  setInterval(() => monitor(CHAT_ID), 15 * 60 * 1000); // A cada 15 minutos

  // Mantém o processo vivo (para Railway, etc)
  process.stdin.resume();
}

start();
