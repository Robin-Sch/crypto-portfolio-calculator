const fetch = require('node-fetch');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const colors = {
    'bitcoin': 'yellow',
    'ethereum': 'purple',
    'binancecoin': 'green',
    'monero': 'red',
    'pancakeswap-token': 'blue'
};

const shortToLongJSON = {
    'btc': 'bitcoin',
    'eth': 'etherium',
    'bnb': 'binancecoin',
    'xmr': 'monero',
    'cake': 'pancakeswap-token'
}

const shortToLong = (coin) => {
    if (Object.keys(shortToLongJSON).includes(coin)) {
        return shortToLongJSON[coin]
    } else if (Object.values(shortToLongJSON).includes(coin)) {
        return coin;
    } else {
        return null;
    }
};

const CG_API = 'https://api.coingecko.com/api/v3';

const db = require('./database.js');
const { INTERESTING_COINS } = require('./wallets.js');
const { calculateTotalBTC, calculateTotalETH, calculateTotalBNB, calculateTotalXMR, calculateTotalMoneroocean, calculateTotalPancakeswap } = require('../currencies/all.js');

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
    const prices = await fetchPrice(['bitcoin', 'ethereum', 'binancecoin', 'monero', 'pancakeswap-token'], fiat);

    const result = [];

    const BTC_WALLETS = db.prepare('SELECT wallet FROM wallets WHERE coin = ?').all(['btc']).map(w => w.wallet);
    if (BTC_WALLETS.length > 0) {
        const btc = await calculateTotalBTC(BTC_WALLETS);
        const btc_price = prices.bitcoin[fiat];

        const btc_fiat = btc * btc_price;

        result.push({ coin: 'bitcoin', amount: btc, amount_fiat: btc_fiat });
    }

    const ETH_WALLETS = db.prepare('SELECT wallet FROM wallets WHERE coin = ?').all(['eth']).map(w => w.wallet);
    if (ETH_WALLETS.length > 0) {
        const eth = await calculateTotalETH(ETH_WALLETS);
        const eth_price = prices.ethereum[fiat];

        const eth_fiat = eth * eth_price;

        result.push({ coin: 'ethereum', amount: eth, amount_fiat: eth_fiat });
    }

    const BNB_WALLETS = db.prepare('SELECT wallet FROM wallets WHERE coin = ?').all(['bnb']).map(w => w.wallet);
    if (BNB_WALLETS.length > 0) {
        const bnb = await calculateTotalBNB(BNB_WALLETS);
        const bnb_price = prices.binancecoin[fiat];

        const bnb_fiat = bnb * bnb_price;

        result.push({ coin: 'binancecoin', amount: bnb, amount_fiat: bnb_fiat });
    }

    const XMR_WALLETS = db.prepare('SELECT wallet FROM wallets WHERE coin = ?').all(['xmr']).map(w => w.wallet);
    if (XMR_WALLETS.length > 0) {
    	const xmr = await calculateTotalXMR(XMR_WALLETS);
    	const xmr_price = prices.monero[fiat];
    	
    	const xmr_fiat = xmr * xmr_price;
    	
    	result.push({ coin: 'monero', amount: xmr, amount_fiat: xmr_fiat });
    }
    
	const PANCAKESWAP_WALLETS = db.prepare('SELECT wallet FROM specialWallets WHERE coin = ?').all(['cake_pcs']).map(w => w.wallet);
	if (PANCAKESWAP_WALLETS.length > 0) {
        const cake = await calculateTotalPancakeswap(PANCAKESWAP_WALLETS);
        const cake_price = prices['pancakeswap-token'][fiat];

        const cake_fiat = cake * cake_price;

        result.push({ coin: 'pancakeswap-token', extra: 'staked', amount: cake, amount_fiat: cake_fiat });
    }

    const MONEROOCEAN_WALLETS = db.prepare('SELECT wallet FROM specialWallets WHERE coin = ?').all(['xmr_mo']).map(w => w.wallet);
    if (MONEROOCEAN_WALLETS.length > 0) {
        const xmr = await calculateTotalMoneroocean(MONEROOCEAN_WALLETS);
        const xmr_price = prices.monero[fiat];

        const xmr_fiat = xmr * xmr_price;

        result.push({ coin: 'monero', extra: 'mined', amount: xmr, amount_fiat: xmr_fiat });
    }

    return result;
}

const getCoinPriceChartData = async (id, fiat, days) => {
    id = shortToLong(id);
    if (!id) return { labels: [], points: [] };

    const market_data = await fetch(`${CG_API}/coins/${id}/market_chart?vs_currency=${fiat}&days=${days}`);
    const market_json = await market_data.json();
    const history_json = market_json.prices;

    const labels = [];
    const points = [];

    for (let i = 0; i < history_json.length; i++){
        const current = history_json[i];

        const date = new Date(current[0]);
        const label = days > 7 ? `${date.getDate()}/${date.getMonth()+1}` : `${date.getDate()}/${date.getMonth()+1} ${date.getHours()}:${date.getMinutes()}`;
        labels.push(label);

        points.push(current[1]);

        if (i === history_json.length - 1) {
            return { labels, points };
        }
    }
}

const getCoinPriceChart = async (id, fiat, days) => {
    id = shortToLong(id);
    if (!id) return 'Invalid coin name';

    const { labels, points } = await getCoinPriceChartData(id, fiat, days);
    const color = colors[id];

    const width = 1080;
    const height = 1080;
    const backgroundColour = 'black';
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour});

    const config = {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: `${id} price in the last ${days} days`,
                data: points,
                fill: true,
                borderColor: color,
                backgroundColor: color
            }]
        }
    }

    const image = await chartJSNodeCanvas.renderToBuffer(config);
    return image;
}

const getPortfolioChart = async (fiat, days) => {
    const coins = (await calculatePortfolio(fiat)).sort(x => x.amount_fiat);

    let labels = [];
    const datasets = [];

    for (let i = 0; i < coins.length; i++) {
        const coinData = coins[i];
        const coin = coinData.coin;
        let { labels: currentLabels, points } = await getCoinPriceChartData(coin, fiat, days);

        labels = currentLabels;
        const color = colors[coin];

        datasets.push({
            label: coin,
            data: points,
            fill: true,
            borderColor: color,
            backgroundColor: color,
        });

        if (i === coins.length - 1) {
            const width = 1080;
            const height = 1080;
            const backgroundColour = 'black';
            const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour});
        
            const config = {
                type: 'line',
                data: {
                    labels,
                    datasets,
                },
                options: {
                    scales: {
                        y: {
                            stacked: true,
                        }
                    }
                  }
            }
        
            const image = await chartJSNodeCanvas.renderToBuffer(config);
            return image;
        }
    }
}

module.exports = { calculateInterestedCoinPrices, calculatePortfolio, getCoinPriceChart, getPortfolioChart };
