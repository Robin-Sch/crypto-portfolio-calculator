const INTERESTING_COINS = JSON.parse(process.env.INTERESTING_COINS) || [];
const SPECIAL_WALLETS = ['cake_pcs', 'xmr_mo'];

const db = require('./database.js');

const addWalletToDatabase = (async (wallet, coin) => {
    const table = SPECIAL_WALLETS.includes(coin) ? 'specialWallets' : 'wallets';

    const current = db.prepare(`SELECT * FROM ${table} WHERE wallet = ? AND coin = ?`).get([wallet, coin]);
    
    if (!current) {
        db.prepare(`INSERT INTO ${table} (wallet, coin) VALUES (?,?)`).run([wallet, coin]);
    }
});

const loadWalletsFromEnv = (async () => {
    const BTC_WALLETS = JSON.parse(process.env.BTC_WALLETS) || [];
    for (let a = 0; a < BTC_WALLETS.length; a++) {
        const wallet = BTC_WALLETS[a];
        addWalletToDatabase(wallet, 'btc');
    }

    const ETH_WALLETS = JSON.parse(process.env.ETH_WALLETS) || [];
    for (let b = 0; b < ETH_WALLETS.length; b++) {
        const wallet = ETH_WALLETS[b];
        addWalletToDatabase(wallet, 'eth');
    }

    const BNB_WALLETS = JSON.parse(process.env.BNB_WALLETS) || [];
    for (let c = 0; c < BNB_WALLETS.length; c++) {
        const wallet = BNB_WALLETS[c];
        addWalletToDatabase(wallet, 'bnb');
    }

    const XMR_WALLETS = JSON.parse(process.env.XMR_WALLETS) || [];
    for (let d = 0; d < XMR_WALLETS.length; d++) {
        const walletData = XMR_WALLETS[d];

        const wallet = walletData.wallet;
        const amount = walletData.amount;

        addWalletToDatabase(wallet, 'xmr');

        db.prepare('INSERT INTO xmr (wallet, amount) VALUES (?,?)').run([wallet, amount]);
    }
    
	const PANCAKESWAP_WALLETS = JSON.parse(process.env.PANCAKESWAP_WALLETS) || [];
    for (let e = 0; e < PANCAKESWAP_WALLETS.length; e++) {
        const wallet = PANCAKESWAP_WALLETS[e];
        addWalletToDatabase(wallet, 'cake_pcs');
    }

	const MONEROOCEAN_WALLETS = JSON.parse(process.env.MONEROOCEAN_WALLETS) || [];
    for (let e = 0; e < MONEROOCEAN_WALLETS.length; e++) {
        const wallet = MONEROOCEAN_WALLETS[e];
        addWalletToDatabase(wallet, 'xmr_mo');
    }
});

const removeWalletFromDatabase = (async (wallet, coin) => {
    if (coin === 'xmr') db.prepare('DELETE FROM xmr WHERE wallet = ?').run([wallet]);

    const table = SPECIAL_WALLETS.includes(coin) ? 'specialWallets' : 'wallets';
    return db.prepare(`DELETE FROM ${table} WHERE wallet = ? AND coin = ?`).run([wallet, coin]);
});

module.exports = { INTERESTING_COINS, addWalletToDatabase, loadWalletsFromEnv, removeWalletFromDatabase };