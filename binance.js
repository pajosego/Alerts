const axios = require('axios');
const API_URL = "https://api.binance.com/api/v3/klines";

async function fetchCandles(symbol, interval, limit = 100) {
  try {
    const url = `${API_URL}?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await axios.get(url);
    return res.data.map(c => ({
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
      volume: parseFloat(c[5])
    }));
  } catch (error) {
    console.error('Erro ao buscar candles:', error.message);
    return [];
  }
}

module.exports = { fetchCandles };
