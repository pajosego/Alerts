const { RSI, MACD, ADX, EMA, ATR } = require('technicalindicators');

function calculateIndicators(candlesRSI, candlesMACD, candlesADX, candlesEMA, candlesATR) {
  const closeRSI = candlesRSI.map(c => c.close);
  const closeMACD = candlesMACD.map(c => c.close);
  const highADX = candlesADX.map(c => c.high);
  const lowADX = candlesADX.map(c => c.low);
  const closeADX = candlesADX.map(c => c.close);
  const closeEMA = candlesEMA.map(c => c.close);
  const highATR = candlesATR.map(c => c.high);
  const lowATR = candlesATR.map(c => c.low);
  const closeATR = candlesATR.map(c => c.close);

  return {
    rsi: RSI.calculate({ period: 14, values: closeRSI }),
    macd: MACD.calculate({
      values: closeMACD,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false
    }),
    adx: ADX.calculate({ close: closeADX, high: highADX, low: lowADX, period: 14 }),
    ema: EMA.calculate({ period: 200, values: closeEMA }),
    atr: ATR.calculate({ high: highATR, low: lowATR, close: closeATR, period: 14 }),
  };
}

module.exports = { calculateIndicators };

