const { sendTelegramAlert } = require('./telegram');

const ALERT_COOLDOWN = 60 * 60 * 1000; // 1 hora em ms
const DAILY_LIMIT = 100;

const alertLog = new Map(); // key: `${symbol}_${type}`, value: timestamp último alerta
const alertCountByDay = new Map(); // key: data YYYY-MM-DD, value: count de alertas

function resetDailyCount() {
  const today = new Date().toISOString().slice(0, 10);
  for (const day of alertCountByDay.keys()) {
    if (day !== today) alertCountByDay.delete(day);
  }
}

function canSendAlert(symbol, type) {
  resetDailyCount();
  const now = Date.now();
  const key = `${symbol}_${type}`;

  // Verifica limite diário total
  const today = new Date().toISOString().slice(0, 10);
  let count = alertCountByDay.get(today) || 0;
  if (count >= DAILY_LIMIT) return false;

  // Verifica cooldown
  if (!alertLog.has(key) || now - alertLog.get(key) > ALERT_COOLDOWN) {
    alertLog.set(key, now);
    alertCountByDay.set(today, count + 1);
    return true;
  }
  return false;
}

function isStrongCandle(candle) {
  const bodySize = Math.abs(candle.close - candle.open);
  const candleRange = candle.high - candle.low;
  if (candleRange === 0) return false;
  return bodySize / candleRange > 0.6;
}

function isHighVolume(candle, avgVolume) {
  return candle.volume > avgVolume * 1.2;
}

function formatAlertMessage(symbol, type, entry, sl, tp, time) {
  const emoji = type === 'compra' ? '🚀' : '🛑';
  return `${emoji} ${type.toUpperCase()} confirmada para ${symbol}!\n` +
         `Entrada: ${entry.toFixed(6)}\n` +
         `Stop Loss: ${sl.toFixed(6)}\n` +
         `Take Profit: ${tp.toFixed(6)}\n` +
         `Horário (UTC): ${time}`;
}

async function analyzeAndAlert(symbol, timeframe, candles, pivots, chatId) {
  if (!pivots) return;

  const lastCandle = candles.at(-1);
  const prevCandle = candles.at(-2);
  if (!lastCandle || !prevCandle) return;

  const volumes = candles.map(c => c.volume);
  const avgVolume = volumes.reduce((a,b) => a+b, 0) / volumes.length;

  const { pivot, R1, S1 } = pivots;

  // Compra (rompimento R1)
  if (
    prevCandle.close <= R1 &&
    lastCandle.close > R1 &&
    isStrongCandle(lastCandle) &&
    isHighVolume(lastCandle, avgVolume)
  ) {
    const distRetest = Math.abs(lastCandle.close - R1) / R1;
    if (distRetest <= 0.002) {
      const entry = lastCandle.close;
      const sl = pivot;
      const risk = entry - sl;
      const tp = entry + risk * 3;

      if (canSendAlert(symbol, 'compra')) {
        const time = new Date().toISOString();
        const msg = formatAlertMessage(symbol, 'compra', entry, sl, tp, time);
        await sendTelegramAlert(chatId, msg);
        console.log(`[${time}] Alerta COMPRA enviado para ${symbol} (${timeframe})`);
      }
    }
  }
  // Venda (rompimento S1)
  else if (
    prevCandle.close >= S1 &&
    lastCandle.close < S1 &&
    isStrongCandle(lastCandle) &&
    isHighVolume(lastCandle, avgVolume)
  ) {
    const distRetest = Math.abs(lastCandle.close - S1) / S1;
    if (distRetest <= 0.002) {
      const entry = lastCandle.close;
      const sl = pivot;
      const risk = sl - entry;
      const tp = entry - risk * 3;

      if (canSendAlert(symbol, 'venda')) {
        const time = new Date().toISOString();
        const msg = formatAlertMessage(symbol, 'venda', entry, sl, tp, time);
        await sendTelegramAlert(chatId, msg);
        console.log(`[${time}] Alerta VENDA enviado para ${symbol} (${timeframe})`);
      }
    }
  } else {
    const time = new Date().toISOString();
    console.log(`[${time}] ${symbol} (${timeframe}): Nenhum sinal válido.`);
  }
}

module.exports = { analyzeAndAlert };
