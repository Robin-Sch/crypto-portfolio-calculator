const fetch = require('node-fetch');

const BNB_API = 'https://api.bscscan.com/api';
const BNB_API_KEY = process.env.BNB_API_KEY;

const calculateTotalBNB = (async (wallets) => {
    if (wallets.length === 0) return 0;

    const amount_data = await fetch(`${BNB_API}/?module=account&action=balancemulti&address=${wallets}&tag=latest&apikey=${BNB_API_KEY}`);
    if (amount_data.status !== 200) return 0;

    const amount_json = await amount_data.json();
    const sum = amount_json.result.map(a => a.balance).reduce((prev, cur) => prev + cur);

    const amount = sum * 1e-18;
    if (isNaN(amount)) return 0;

    return amount;
});

module.exports = { calculateTotalBNB };