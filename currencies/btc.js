const fetch = require('node-fetch');

const BTC_API = 'https://blockchain.info';

const calculateTotalBTC = (async (fiat, wallets) => {
  if (wallets.length === 0) return 0;

  const amount_data = await fetch(`${BTC_API}/balance?active=${wallets}`);
  if (amount_data.status !== 200) return 0;

  const amount_json = await amount_data.json();
  const sum = Object.values(amount_json).map(a => a.final_balance).reduce((prev, cur) => prev + cur);
  
  const amount = sum * 1e-8;
  if (isNaN(amount)) return 0;

  return amount;
});

module.exports = { calculateTotalBTC };