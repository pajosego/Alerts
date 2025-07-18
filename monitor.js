require('dotenv').config();
const { fetchCandles } = require('./binance');
const { calculateIndicators } = require('./indicators');
const { analyzeAndAlert } = require('./alerts');

const SYMBOLS = [
  "BTCUSDT", "ETHUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT",
  "SOLUSDT", "DOGEUSDT", "DOTUSDT", "LTCUSDT",
  "AVAXUSDT", "MATICUSDT", "LINKUSDT"
];

const INTERVALS = {
  rsi: "5m",
  macd: "30m",
  adx: "30m",
  ema: "4h",
  atr: "5m"
};

async function monitor(chatId) {
  console.log("Iniciando monitoramento...");
  for (const symbol of SYMBOLS) {
    try {
      const [candlesRSI, candlesMACD, candlesADX, candlesEMA, candlesATR] = await Promise.all([
        fetchCandles(symbol, INTERVALS.rsi),
        fetchCandles(symbol, INTERVALS.macd),
        fetchCandles(symbol, INTERVALS.adx),
        fetchCandles(symbol, INTERVALS.ema, 200),
        fetchCandles(symbol, INTERVALS.atr)
      ]);

      const indicators = calculateIndicators(candlesRSI, candlesMACD, candlesADX, candlesEMA, candlesATR);
      const closePrice = candlesRSI[candlesRSI.length - 1].close;

      await analyzeAndAlert(symbol, indicators, closePrice, chatId);
    } catch (error) {
      console.error(`Erro ao analisar ${symbol}:`, error.message);
    }
  }
  console.log("Monitoramento concluído.");
}

module.exports = { monitor };
