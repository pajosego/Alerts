const { EMA } = require('technicalindicators');

function calculateEMA(closePrices, period = 200) {
  if (closePrices.length < period) return [];
  return EMA.calculate({ period, values: closePrices });
}

module.exports = { calculateEMA };
