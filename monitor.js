const { fetchCandles } = require('./binance');
const { calculatePivotLevels } = require('./calculatePivotLevels');
const { analyzeAndAlert } = require('./alerts');

const SYMBOLS = ['BTCUSDT', 'ETHUSDT']; // Pode adicionar mais pares
const TIMEFRAMES = ['15m', '1h'];       // Timeframes que quiser monitorar
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function monitor() {
  for (const symbol of SYMBOLS) {
    for (const tf of TIMEFRAMES) {
      const candles = await fetchCandles(symbol, tf, 50);
      if (candles.length === 0) {
        console.log(`Sem candles para ${symbol} ${tf}`);
        continue;
      }
      const pivots = calculatePivotLevels(candles);
      await analyzeAndAlert(symbol, tf, candles, pivots, CHAT_ID);
    }
  }
}

async function startMonitoring() {
  // Roda a cada 15 minutos, por exemplo
  await monitor();
  setInterval(monitor, 15 * 60 * 1000);
}

startMonitoring();
