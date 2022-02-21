const { calculateTotalBTC } = require('./btc.js');
const { calculateTotalETH } = require('./eth.js');
const { calculateTotalBNB } = require('./bnb.js');
const { calculateTotalXMR } = require('./xmr.js');
const { calculateTotalPancakeswap } = require('./special/pancakeswap.js');
const { calculateTotalMoneroocean } = require('./special/moneroocean.js');

module.exports = { calculateTotalBTC, calculateTotalETH, calculateTotalBNB, calculateTotalXMR, calculateTotalPancakeswap, calculateTotalMoneroocean };