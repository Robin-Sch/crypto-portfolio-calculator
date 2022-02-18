const MONEROOCEAN_WALLETS = JSON.parse(process.env.MONEROOCEAN_WALLETS) || [];
const INTERESTING_COINS = JSON.parse(process.env.INTERESTING_COINS) || [];

const db = require('./database.js');

const addWalletToDatabase = (async (wallet, coin) => {
    const current = db.prepare('SELECT * FROM wallets WHERE wallet = ? AND coin = ?').get([wallet, coin]);
    
    if (!current) {
        db.prepare('INSERT INTO wallets (wallet, coin) VALUES (?,?)').run([wallet, coin]);
    }
});

const removeWalletFromDatabase = (async (wallet, coin) => {
    if (coin === 'xmr') db.prepare('DELETE FROM xmr WHERE wallet = ?').run([wallet]);

    return db.prepare('DELETE FROM wallets WHERE wallet = ? AND coin = ?').run([wallet, coin]);
});

module.exports = { MONEROOCEAN_WALLETS, INTERESTING_COINS, addWalletToDatabase, removeWalletFromDatabase };