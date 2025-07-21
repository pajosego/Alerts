function isSupport(candles, i) {
  return (
    candles[i].low < candles[i - 1].low &&
    candles[i].low < candles[i + 1].low &&
    candles[i + 1].low < candles[i + 2].low &&
    candles[i - 1].low < candles[i - 2].low
  );
}

function isResistance(candles, i) {
  return (
    candles[i].high > candles[i - 1].high &&
    candles[i].high > candles[i + 1].high &&
    candles[i + 1].high > candles[i + 2].high &&
    candles[i - 1].high > candles[i - 2].high
  );
}

function detectLevels(candles, tolerance = 0.005) {
  const levels = [];

  for (let i = 2; i < candles.length - 2; i++) {
    if (isSupport(candles, i)) {
      const level = candles[i].low;
      if (!levels.some(l => Math.abs(l - level) / level < tolerance)) {
        levels.push(level);
      }
    }

    if (isResistance(candles, i)) {
      const level = candles[i].high;
      if (!levels.some(l => Math.abs(l - level) / level < tolerance)) {
        levels.push(level);
      }
    }
  }

  return levels.sort((a, b) => a - b);
}

module.exports = { detectLevels };
