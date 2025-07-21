function calculatePivotLevels(candles) {
  if (candles.length < 2) return null;

  const prev = candles.at(-2);
  const high = prev.high;
  const low = prev.low;
  const close = prev.close;

  const pivot = (high + low + close) / 3;
  const R1 = 2 * pivot - low;
  const S1 = 2 * pivot - high;
  const R2 = pivot + (high - low);
  const S2 = pivot - (high - low);

  return {
    pivot: +pivot.toFixed(6),
    R1: +R1.toFixed(6),
    S1: +S1.toFixed(6),
    R2: +R2.toFixed(6),
    S2: +S2.toFixed(6)
  };
}

module.exports = { calculatePivotLevels };
