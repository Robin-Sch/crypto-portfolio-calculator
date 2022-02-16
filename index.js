require('dotenv').config();
const fetch = require('node-fetch');

const CG_API = 'https://api.coingecko.com/api/v3';

const BTC_WALLETS = JSON.parse(process.env.BTC_WALLETS) || [];
const ETH_WALLETS = JSON.parse(process.env.ETH_WALLETS) || [];
const BNB_WALLETS = JSON.parse(process.env.BNB_WALLETS) || [];
const INTERESTING_COINS = JSON.parse(process.env.INTERESTING_COINS) || [];
const FIAT = process.env.FIAT || 'usd';

const { calculateTotalBTC } = require('./currencies/btc.js');
const { calculateTotalETH } = require('./currencies/eth.js');
const { calculateTotalBNB } = require('./currencies/bnb.js');

const fetchPrice = (async (id, fiat) => {
  const price_data = await fetch(`${CG_API}/simple/price?ids=${id}&vs_currencies=${fiat}`);
  const price_json = await price_data.json();
  return price_json;
});

const calculateInterestedCoinPrices = async (fiat) => {
  if (INTERESTING_COINS.length > 0) {
    const prices = await fetchPrice(INTERESTING_COINS, fiat);
  
    for (let i = 0; i < INTERESTING_COINS.length; i++) {
      const name = INTERESTING_COINS[i];
      console.log(`Current price of ${name}: ${prices[name][fiat]} ${fiat}`);
    };
  }
}

const calculatePortfolio = async (fiat) => {
  const prices = await fetchPrice(['bitcoin', 'ethereum', 'binancecoin'], fiat);

  if (BTC_WALLETS.length > 0) {
    const btc = await calculateTotalBTC(fiat, BTC_WALLETS);
    const btc_price = prices.bitcoin[fiat];
    console.log(`You have ${btc} BTC (${(btc * btc_price).toFixed(2)} ${fiat})`);
  }
  
  if (ETH_WALLETS.length > 0) {
    const eth = await calculateTotalETH(fiat, ETH_WALLETS);
    const eth_price = prices.ethereum[fiat];
    console.log(`You have ${eth} ETH (${(eth * eth_price).toFixed(2)} ${fiat})`);
  }

  if (BNB_WALLETS.length > 0) {
    const bnb = await calculateTotalBNB(fiat, BNB_WALLETS);
    const bnb_price = prices.binancecoin[fiat];
    console.log(`You have ${bnb} BNB (${(bnb * bnb_price).toFixed(2)} ${fiat})`);
  }
}

(async () => {
  calculateInterestedCoinPrices(FIAT);
  calculatePortfolio(FIAT);
})();