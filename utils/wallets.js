const MONEROOCEAN_WALLETS = JSON.parse(process.env.MONEROOCEAN_WALLETS) || [];
const INTERESTING_COINS = JSON.parse(process.env.INTERESTING_COINS) || [];

const db = require('./database.js');

const addWalletToDatabase = (async (wallet, coin) => {
    const current = db.prepare('SELECT * FROM wallets WHERE wallet = ? AND coin = ?').get([wallet, coin]);
    
    if (!current) {
        db.prepare('INSERT INTO wallets (wallet, coin) VALUES (?,?)').run([wallet, coin]);
    }
});

const addAllWalletsToDatabase = (async () => {
    const BTC_WALLETS = db.prepare('SELECT wallet FROM wallets WHERE coin = ?').all(['btc']).map(w => w.wallet);
    for (let a = 0; a < BTC_WALLETS.length; a++) {
        const wallet = BTC_WALLETS[a];
        addWalletToDatabase(wallet, 'btc');
    }

    const ETH_WALLETS = db.prepare('SELECT wallet FROM wallets WHERE coin = ?').all(['eth']).map(w => w.wallet);
    for (let b = 0; b < ETH_WALLETS.length; b++) {
        const wallet = ETH_WALLETS[b];
        addWalletToDatabase(wallet, 'eth');
    }

    const BNB_WALLETS = db.prepare('SELECT wallet FROM wallets WHERE coin = ?').all(['bnb']).map(w => w.wallet);
    for (let c = 0; c < BNB_WALLETS.length; c++) {
        const wallet = BNB_WALLETS[c];
        addWalletToDatabase(wallet, 'bnb');
    }
});

const removeWalletFromDatabase = (async (wallet, coin) => {
    return db.prepare('DELETE FROM wallets WHERE wallet = ? AND coin = ?').run([wallet, coin]);
});

module.exports = { MONEROOCEAN_WALLETS, INTERESTING_COINS, addAllWalletsToDatabase, addWalletToDatabase, removeWalletFromDatabase };