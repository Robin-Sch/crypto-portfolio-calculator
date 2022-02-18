require('dotenv').config();
const prompts = require('prompts');

const FIAT = process.env.FIAT || 'usd';
const COINS = [{ title: 'Bitcoin', value: 'btc' },
    { title: 'Ethereum', value: 'eth' },
    { title: 'Binance Coin', value: 'bnb' },
    { title: 'Monero', value: 'xmr'},
    { title: 'Moneroocean', value: 'xmr_mo' }];

const { calculateTotalMoneroocean } = require('./extra/moneroocean.js');
const { calculateInterestedCoinPrices, calculatePortfolio } = require('./utils/calculate.js');
const db = require('./utils/database.js');
const { INTERESTING_COINS, addWalletToDatabase, loadWalletsFromEnv, removeWalletFromDatabase } = require('./utils/wallets.js');

const main = async (output) => {
    if (output) console.log('\n' + output + '\n');

    const response = await prompts({
        type: 'select',
        name: 'choice',
        message: 'What do you want to do?',
        choices: [
            { title: 'Calculate my portfolio', value: 'calculatePortfolio' },
            { title: 'View interested coin prices', value: 'calculateInterestedCoinPrices' },
            { title: 'Load wallets from the .env file', value: 'loadWalletsFromEnv' },
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
    } else if (response.choice === 'loadWalletsFromEnv') {
        loadWalletsFromEnv();
        return main('All wallets have been added!');
    } else if (response.choice === 'addWalletToDatabase') {
        const response2 = await prompts({
            type: 'select',
            name: 'coin',
            message: 'For which coin is the wallet?',
            choices: COINS,
        });

        const coin = response2.coin;

        const response3 = await prompts({
            type: 'text',
            name: 'wallet',
            message: 'What is the public wallet address?'
        });

        const wallet = response3.wallet;
        let amount = null;

        if (coin === 'xmr') {
            const old = db.prepare('SELECT amount FROM xmr WHERE wallet = ?').get([wallet]);

            const response4 = await prompts({
                type: 'number',
                name: 'amount',
                message: `What is the amount of Monero in this wallet? (previously: ${old || 0})`,
                float: true
            });

            amount = response4.amount;
            if (amount === '' || !amount) return main('Invalid amount, please try again!');
        }


        await addWalletToDatabase(wallet, coin);
        if (coin === 'xmr' && amount) db.prepare('INSERT INTO xmr (wallet, amount) VALUES (?,?)').run([wallet, amount]);

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
        const choices = [].concat(wallets);

        if (coin == 'xmr') {
            const rows = db.prepare(`SELECT wallet, amount FROM xmr WHERE wallet IN (${wallets.map(() => '?').join(',')})`).all(wallets);

            choices.forEach((wallet, index, arr) => {
                const amount = rows.find(row => row.wallet === wallet).amount;
                if (amount) arr[index] = `${wallet} (${amount})`;
            });
        }

        choices.forEach((choice, index, arr) => {
            arr[index] = { title: choice, value: wallets[index] }
        });

        const response3 = await prompts({
            type: 'multiselect',
            name: 'wallets',
            message: 'What are the wallet(s)?',
            choices,
        });
        
        const walletsToDelete = response3.wallets;
        if (!walletsToDelete || walletsToDelete.length === 0) return main('You didn\'t select any wallet');

        for(let i = 0; i < walletsToDelete.length; i++) {
            await removeWalletFromDatabase(response3.wallets[i], coin);

            if(i === walletsToDelete.length - 1) {
                return main('Wallet(s) have been removed!');
            }
        }
    } else if (response.choice === 'exit') {
        return process.exit();
    } else {
        return main(`You selected an invalid option! (${response.choice})`);
    }
}

main();