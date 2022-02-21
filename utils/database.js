const db = require('better-sqlite3')('database.sqlite');

db.prepare('CREATE TABLE IF NOT EXISTS wallets (wallet TEXT, coin TEXT, PRIMARY KEY (wallet))').run();
db.prepare('CREATE TABLE IF NOT EXISTS specialWallets (wallet TEXT, coin TEXT, PRIMARY KEY (wallet))').run();
db.prepare('CREATE TABLE IF NOT EXISTS history (date TEXT, balance TEXT)').run();
db.prepare('CREATE TABLE IF NOT EXISTS xmr (wallet TEXT, amount TEXT, FOREIGN KEY (wallet) REFERENCES wallets(wallet))').run();

module.exports = db;