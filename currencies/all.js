const { calculateTotalBTC } = require('./btc.js');
const { calculateTotalETH } = require('./eth.js');
const { calculateTotalBNB } = require('./bnb.js');
const { calculateTotalXMR } = require('./xmr.js');
const { calculateTotalMoneroocean } = require('../extra/moneroocean.js');

module.exports = { calculateTotalBTC, calculateTotalETH, calculateTotalBNB, calculateTotalXMR, calculateTotalMoneroocean };