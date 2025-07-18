const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false });

function sendTelegramAlert(chatId, message) {
  return bot.sendMessage(chatId, message)
    .catch(e => console.error("Erro Telegram:", e.message));
}

module.exports = { sendTelegramAlert };
