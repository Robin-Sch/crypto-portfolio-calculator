//  https://gist.github.com/numtel/ce52b7d07cc62412eb5207b29f119d3b

const https = require('https');
// v1, v2
const CONTRACTS = ["0xa80240Eb5d7E05d3F250cF000eEc0891d00b51CC", "0x45c54210128a065de780C4B0Df3d16664f7f859e"]

function post(hostname, data, path) {
  const options = {
    hostname, path: path || '/', method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let buffer = '';
      res.on('data', (d) => {
        buffer += d;
      });
      res.on('end', () => {
        resolve(buffer);
      })
    });
    req.on('error', (e) => {
      reject(e);
    });
    req.write(data);
    req.end();
  })
}

const getPricePerFullShare = (address) => {
  return `{"jsonrpc":"2.0","id":1,"method":"eth_call","params":[{"from":"0x0000000000000000000000000000000000000000","data":"0x77c7b8fc000000000000000000000000","to":"${address}"},"latest"]}`;
}
const userInfo = (address, acct) => {
  return `{"jsonrpc":"2.0","id":1,"method":"eth_call","params":[{"from":"0x0000000000000000000000000000000000000000","data":"0x1959a002000000000000000000000000${acct.slice(-40)}","to":"${address}"},"latest"]}`;
}

class RpcCaller {
  constructor() {
    this.decimals = 18; // XXX: All use the same so hardcode it
    this.balanceDecimals = 18;
  }
  async _rpc(data, skipTransform) {
    const resp = await post(this.rpcUrl, data, this.rpcPath);
    let parsed;
    try {
      parsed = JSON.parse(resp);
    } catch(err) {
      console.error(resp);
      throw err;
    }
    if(!('result' in parsed)) {
      console.error('Missing result property!', this.beefyContract);
      console.error(parsed);
    }
    try {
      if(skipTransform) return parsed.result;
      return BigInt(parsed.result);
    } catch(err) {
      console.error(resp);
      throw err;
    }
  }
}


class BscRpc extends RpcCaller {
  constructor() {
    super();
    this.rpcUrl = "binance.ankr.com";
  }
}

class CakeVault extends BscRpc {
  constructor(acct, contract) {
    super();
    this.contract = contract || '0x45c54210128a065de780C4B0Df3d16664f7f859e';
    this.acct = acct;
    this.shares = null;
    this.pricePerShare = null;
  }
  async _fetch() {
    this.pricePerShare = await this._rpc(getPricePerFullShare(this.contract));
    const userInfoResp = await this._rpc(userInfo(this.contract, this.acct), true);
    this.shares = BigInt(userInfoResp.slice(0,66));
  }
  async getBalance() {
    if(this.shares === null) await this._fetch();
    return (Number(this.shares) / Math.pow(10, this.decimals))
      * (Number(this.pricePerShare) / Math.pow(10, this.decimals));
  }
}

const calculateTotalPancakeswap = (async (wallets) => {
  if (wallets.length === 0) return 0;

  total = 0;

  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    const amount = await calculatePancakeswap(wallet);

    total += amount;

    if (i == wallets.length - 1) return total;
  }
});

const calculatePancakeswap = (async (wallet) => {
  let amount = 0;

	for (let i = 0; i < CONTRACTS.length; i++) {
    const myCakeVault = new CakeVault(wallet, CONTRACTS[i]);
    amount += await myCakeVault.getBalance();
    
    if (i == CONTRACTS.length - 1) {
      return amount;
    }
  }
});

module.exports = { calculateTotalPancakeswap };