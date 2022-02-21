const db = require('../utils/database.js');

const calculateTotalXMR = (async (wallets) => {
    if (wallets.length === 0) return 0;

    const rows = db.prepare(`SELECT amount FROM xmr WHERE wallet IN (${wallets.map(() => '?').join(',')})`).all(wallets);
    const amount = rows.map(a => parseFloat(a.amount)).reduce((prev, cur) => prev + cur);

    return amount;
});

module.exports = { calculateTotalXMR };