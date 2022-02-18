const fetch = require('node-fetch');

const ETH_API = 'https://api.etherscan.io/api';
const ETH_API_KEY = process.env.ETH_API_KEY;

const calculateTotalETH = (async (fiat, wallets) => {
    if (wallets.length === 0) return 0;

    const amount_data = await fetch(`${ETH_API}/?module=account&action=balancemulti&address=${wallets}&tag=latest&apikey=${ETH_API_KEY}`);
    if (amount_data.status !== 200) return 0;

    const amount_json = await amount_data.json();
    const sum = amount_json.result.map(a => a.balance).reduce((prev, cur) => prev + cur);

    const amount = sum * 1e-18;
    if (isNaN(amount)) return 0;

    return amount;
});

module.exports = { calculateTotalETH };