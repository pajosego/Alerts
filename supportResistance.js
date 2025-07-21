function detectSupportResistance(candles) {
  const levels = [];

  for (let i = 2; i < candles.length - 2; i++) {
    const prev = candles[i - 1];
    const curr = candles[i];
    const next = candles[i + 1];

    const isSupport = curr.low < prev.low && curr.low < next.low;
    const isResistance = curr.high > prev.high && curr.high > next.high;

    if (isSupport) levels.push(+curr.low.toFixed(2));
    if (isResistance) levels.push(+curr.high.toFixed(2));
  }

  return Array.from(new Set(levels));
}

module.exports = { detectSupportResistance };
