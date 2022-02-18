const fetch = require('node-fetch');
const CG_API = 'https://api.coingecko.com/api/v3';

const db = require('./database.js');
const { MONEROOCEAN_WALLETS, INTERESTING_COINS } = require('./wallets.js');
const { calculateTotalBTC, calculateTotalETH, calculateTotalBNB, calculateTotalMoneroocean } = require('../currencies/all.js');

const fetchPrice = (async (id, fiat) => {
    const price_data = await fetch(`${CG_API}/simple/price?ids=${id}&vs_currencies=${fiat}`);
    const price_json = await price_data.json();
    return price_json;
});

const calculateInterestedCoinPrices = async (fiat) => {
    if (INTERESTING_COINS.length > 0) {
        const prices = await fetchPrice(INTERESTING_COINS, fiat);

        return prices;
    }
}

const calculatePortfolio = async (fiat) => {
    const prices = await fetchPrice(['bitcoin', 'ethereum', 'binancecoin', 'monero'], fiat);

    const result = [];

    const BTC_WALLETS = db.prepare('SELECT wallet FROM wallets WHERE coin = ?').all(['btc']).map(w => w.wallet);
    if (BTC_WALLETS.length > 0) {
        const btc = await calculateTotalBTC(fiat, BTC_WALLETS);
        const btc_price = prices.bitcoin[fiat];

        const btc_fiat = btc * btc_price;

        result.push({ coin: 'btc', amount: btc, amount_fiat: btc_fiat });
    }

    const ETH_WALLETS = db.prepare('SELECT wallet FROM wallets WHERE coin = ?').all(['eth']).map(w => w.wallet);
    if (ETH_WALLETS.length > 0) {
        const eth = await calculateTotalETH(fiat, ETH_WALLETS);
        const eth_price = prices.ethereum[fiat];

        const eth_fiat = eth * eth_price;

        result.push({ coin: 'eth', amount: eth, amount_fiat: eth_fiat });
    }

    const BNB_WALLETS = db.prepare('SELECT wallet FROM wallets WHERE coin = ?').all(['bnb']).map(w => w.wallet);
    if (BNB_WALLETS.length > 0) {
        const bnb = await calculateTotalBNB(fiat, BNB_WALLETS);
        const bnb_price = prices.binancecoin[fiat];

        const bnb_fiat = bnb * bnb_price;

        result.push({ coin: 'bnb', amount: bnb, amount_fiat: bnb_fiat });
    }

    const MONEROOCEAN_WALLETS = db.prepare('SELECT wallet FROM wallets WHERE coin = ?').all(['xmr_mo']).map(w => w.wallet);
    if (MONEROOCEAN_WALLETS.length > 0) {
        const xmr = await calculateTotalMoneroocean(fiat, MONEROOCEAN_WALLETS);
        const xmr_price = prices.monero[fiat];

        const xmr_fiat = xmr * xmr_price;

        result.push({ coin: 'xmr', extra: 'mined', amount: xmr, amount_fiat: xmr_fiat });
    }

    return result;
}

module.exports = { calculateInterestedCoinPrices, calculatePortfolio };