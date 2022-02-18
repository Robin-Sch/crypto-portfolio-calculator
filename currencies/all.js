const { calculateTotalBTC } = require('./btc.js');
const { calculateTotalETH } = require('./eth.js');
const { calculateTotalBNB } = require('./bnb.js');
const { calculateTotalMoneroocean } = require('../extra/moneroocean.js');

module.exports = { calculateTotalBTC, calculateTotalETH, calculateTotalBNB, calculateTotalMoneroocean };