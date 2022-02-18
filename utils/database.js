const db = require('better-sqlite3')('database.sqlite');

db.prepare('CREATE TABLE IF NOT EXISTS wallets (wallet TEXT, coin TEXT, PRIMARY KEY (wallet))').run();
db.prepare('CREATE TABLE IF NOT EXISTS history (date TEXT, balance TEXT)').run();

module.exports = db;