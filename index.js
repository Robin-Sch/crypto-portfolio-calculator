require('dotenv').config();
const prompts = require('prompts');

const FIAT = process.env.FIAT || 'usd';
const COINS = [{ title: 'Bitcoin', value: 'btc' },
    { title: 'Ethereum', value: 'eth' },
    { title: 'Binance Coin', value: 'bnb' },
    { title: 'Moneroocean', value: 'xmr_mo' }];

const { calculateTotalMoneroocean } = require('./extra/moneroocean.js');
const { calculateInterestedCoinPrices, calculatePortfolio } = require('./utils/calculate.js');
const db = require('./utils/database.js');
const { INTERESTING_COINS, addAllWalletsToDatabase, addWalletToDatabase, removeWalletFromDatabase } = require('./utils/wallets.js');

const main = async (output) => {
    if (output) console.log('\n' + output + '\n');

    const response = await prompts({
        type: 'select',
        name: 'choice',
        message: 'What do you want to do?',
        choices: [
            { title: 'Calculate my portfolio', value: 'calculatePortfolio' },
            { title: 'View interested coin prices', value: 'calculateInterestedCoinPrices' },
            { title: 'Add a new wallet', value: 'addWalletToDatabase' },
            { title: 'Remove a wallet', value: 'removeWalletFromDatabase' },
            { title: 'Exit', value: 'exit' }
        ],
    });

    if (response.choice === 'calculatePortfolio') {
        const res = await calculatePortfolio(FIAT);
        if (res.length === 0) return main('You don\'t have added your wallet(s) yet');

        let total_fiat = 0;
        let msg = '';

        for(let i = 0; i < res.length; i++) {
            const current = res[i];
            const { amount, coin, extra, amount_fiat } = current;

            total_fiat += current.amount_fiat;

            msg += `You have ${extra ? extra + ' ' : ''}${amount} ${coin} (${amount_fiat.toFixed(2)} ${FIAT})\n`;

            if (i === res.length - 1) {
                msg += `You have ${total_fiat.toFixed(2)} ${FIAT} in total\n`;
                return main(msg)
            }
        }
    } else if (response.choice === 'calculateInterestedCoinPrices') {
        const prices = await calculateInterestedCoinPrices(FIAT);

        let msg = '';

        for (let i = 0; i < INTERESTING_COINS.length; i++) {
            const name = INTERESTING_COINS[i];

            msg += `Current price of ${name}: ${prices[name][FIAT]} ${FIAT}\n`;

            if (i === INTERESTING_COINS.length - 1) {
                return main(msg);
            }
        }
    } else if (response.choice === 'addWalletToDatabase') {
        const response2 = await prompts([{
            type: 'select',
            name: 'coin',
            message: 'For which coin is the wallet?',
            choices: COINS,
        },{
            type: 'text',
            name: 'wallet',
            message: 'What is the wallet address?'
        }]);

        await addWalletToDatabase(response2.wallet, response2.coin);
        return main('Wallet has been added!');
    } else if (response.choice === 'removeWalletFromDatabase') {
        const existingCoins = db.prepare('SELECT DISTINCT coin AS value FROM wallets').all();
        existingCoins.map(coin => {
            coin.title = COINS.find(c => c.value === coin.value)?.title;
        });

        if (existingCoins.length === 0) return main('You don\'t have any wallet yet');

        const response2 = await prompts({
            type: 'select',
            name: 'coin',
            message: 'For which coin is the wallet?',
            choices: existingCoins,
        });

        const coin = response2.coin;
        const wallets = db.prepare('SELECT wallet FROM wallets WHERE coin = ?').all([coin]).map(w => w.wallet);

        const response3 = await prompts({
            type: 'multiselect',
            name: 'wallets',
            message: 'What are the wallet(s)?',
            choices: wallets,
        });
        
        const walletsToDelete = response3.wallets;
        if (walletsToDelete.length === 0) return main('You didn\'t select any wallet');

        for(let i = 0; i < walletsToDelete.length; i++) {
            const indexToDelete = response3.wallets[i];
            await removeWalletFromDatabase(wallets[indexToDelete], coin);

            if(i === walletsToDelete.length - 1) {
                return main('Wallet(s) have been removed!');
            }
        }
    } else if (response.choice === 'exit') {
        return process.exit();
    } else {
        return main('You selectd an invalid option!');
    }
}

main();