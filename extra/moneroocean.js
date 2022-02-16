const fetch = require('node-fetch');

const BTC_API = 'https://blockchain.info';

const calculateTotalMoneroocean = (async (fiat, wallets) => {
  if (wallets.length === 0) return 0;

  total = 0;

  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    const amount = await calculateMoneroocean(fiat, wallet);

    total += amount;

    if (i == wallets.length - 1) {
        return total;
    }
  }
});

const calculateMoneroocean = (async (fiat, wallet) => {
  const stats_data = await fetch(`https://api.moneroocean.stream/miner/${wallet}/stats`);
  const stats_json = await stats_data.json();
  return stats_json.amtDue * 1e-12;
})

module.exports = { calculateTotalMoneroocean };