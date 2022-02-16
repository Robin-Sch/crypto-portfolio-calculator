# Crypto Portfolio Calculator

Crypto Portfolio Calculator is a simple script which will calculate the total worth of all my cryptocurrencies across different wallets.

## My coin is not supported

Please open an issue and I'll take a look at it. If you know an API for the data, please send that too (preferable without needing to register an account).

## Installation

Install [nodejs](https://nodejs.org/en/download/).

Rename `.env.example` to `.env`, and fill in the secrets.

You can put an empty array (`[]`) for the wallets and it will skip that.

Use `INTERESTING_COINS` to change the coins you want to get the current price of (coingecko id's).

Change `FIAT` to something like `usd`, `eur`, `gbp` etc. to change the currency.

You can leave out `ETH_API_KEY` and `BNB_API_KEY`. If you hit rate limits, use [etherscan](https://etherscan.io/) and [bscscan](https://bscscan.com/) to get the key(s).

If you're mining on [moneroocean](https://moneroocean.stream/), you can fill in `MONEROOCEAN_WALLETS` and it will automatically calculate the total amount you've mined.

Run `npm i` to install the dependencies.

## Usage

Run `npm start` to start.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
