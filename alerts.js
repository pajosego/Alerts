// alerts.js — lógica de alertas profissionalizada
const { sendTelegramAlert } = require('./telegram');

const ALERT_SCORE_THRESHOLD = 3.5;
const ALERT_COOLDOWN = 60 * 60 * 1000; // 1 hora
const lastAlerts = {};

function canSendAlert(symbol, type) {
  const now = Date.now();
  if (!lastAlerts[symbol]) lastAlerts[symbol] = {};
  if (!lastAlerts[symbol][type] || now - lastAlerts[symbol][type] > ALERT_COOLDOWN) {
    lastAlerts[symbol][type] = now;
    return true;
  }
  return false;
}

function calculateTP(entry, atr, direction, rr = 2) {
  return +(direction === 'long'
    ? entry + rr * atr
    : entry - rr * atr).toFixed(6);
}

function calculateSL(entry, atr, direction) {
  return +(direction === 'long'
    ? entry - atr
    : entry + atr).toFixed(6);
}

function formatAlertMessage(symbol, type, entry, sl, tp, rsi, macd, adx, score) {
  const emoji = type === "compra" ? "🚀" : "🛑";
  return `${emoji} ${type.toUpperCase()} detectada para ${symbol}!
Entrada: ${entry.toFixed(6)}
Stop Loss: ${sl.toFixed(6)}
Take Profit: ${tp.toFixed(6)}
RSI5m: ${rsi.toFixed(2)}
MACD30m: ${macd.MACD.toFixed(4)} ${type === "compra" ? ">" : "<"} ${macd.signal.toFixed(4)}
ADX30m: ${adx.adx.toFixed(2)}
Score: ${score.toFixed(2)}`;
}

async function analyzeAndAlert(symbol, indicators, closePrice, chatId) {
  const { rsi, macd, adx, ema, atr } = indicators;
  const lastRSI = rsi.at(-1);
  const lastMACD = macd.at(-1);
  const lastADX = adx.at(-1);
  const lastEMA = ema.at(-1);
  const lastATR = atr.at(-1) || 0;

  const isUpTrend = closePrice > lastEMA;
  const isDownTrend = closePrice < lastEMA;
  const adxStrong = lastADX?.adx >= 25;

  let scoreCompra = 0;
  if (lastRSI < 30) scoreCompra += 1.5;
  if (lastMACD.MACD > lastMACD.signal) scoreCompra += 1.5;
  if (isUpTrend) scoreCompra += 1;
  if (adxStrong) scoreCompra += 1;

  let scoreVenda = 0;
  if (lastRSI > 70) scoreVenda += 1.5;
  if (lastMACD.MACD < lastMACD.signal) scoreVenda += 1.5;
  if (isDownTrend) scoreVenda += 1;
  if (adxStrong) scoreVenda += 1;

  if (scoreCompra >= ALERT_SCORE_THRESHOLD && canSendAlert(symbol, "compra")) {
    const entry = closePrice;
    const sl = calculateSL(entry, lastATR, 'long');
    const tp = calculateTP(entry, lastATR, 'long');
    const msg = formatAlertMessage(symbol, "compra", entry, sl, tp, lastRSI, lastMACD, lastADX, scoreCompra);
    await sendTelegramAlert(chatId, msg);
    console.log(`[${new Date().toLocaleTimeString()}] Alerta enviado: ${symbol} (COMPRA) Score: ${scoreCompra.toFixed(2)}`);

  } else if (scoreVenda >= ALERT_SCORE_THRESHOLD && canSendAlert(symbol, "venda")) {
    const entry = closePrice;
    const sl = calculateSL(entry, lastATR, 'short');
    const tp = calculateTP(entry, lastATR, 'short');
    const msg = formatAlertMessage(symbol, "venda", entry, sl, tp, lastRSI, lastMACD, lastADX, scoreVenda);
    await sendTelegramAlert(chatId, msg);
    console.log(`[${new Date().toLocaleTimeString()}] Alerta enviado: ${symbol} (VENDA) Score: ${scoreVenda.toFixed(2)}`);

  } else {
    console.log(`[${symbol}] Nenhum sinal forte. Scores: Compra=${scoreCompra.toFixed(2)}, Venda=${scoreVenda.toFixed(2)}`);
  }
}

module.exports = { analyzeAndAlert };
