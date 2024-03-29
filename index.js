require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

const FIAT = process.env.FIAT || 'usd';
const PORT = process.env.PORT || 3000;

const { calculateInterestedCoinPrices, calculatePortfolio, getCoinPriceChart, getPortfolioChart } = require('./utils/calculate.js');
app.use(express.json());
app.get("/", async (req, res) => {
    return res.status(200).sendFile(path.join(__dirname, "index.html"));
})
app.get('/calculatePortfolio', async (req, res) => {
    const coins = (await calculatePortfolio(FIAT)).sort((a, b) => a.amount_fiat > b.amount_fiat ? -1 : (a.amount_fiat < b.amount_fiat) ? 1 : 0);
    if (coins.length === 0) return res.status(200).send({ result: '', error: 'You don\'t have added your wallet(s) yet' });

    return res.status(200).json({ result: coins, error: '' });
});
app.get('/calculateTotalPortfolio', async (req, res) => {
    const coins = await calculatePortfolio(FIAT);
    if (coins.length === 0) return res.status(200).send({ result: '', error: 'You don\'t have added your wallet(s) yet' });

    let total_fiat = 0;

    for(let i = 0; i < coins.length; i++) {
        total_fiat += coins[i].amount_fiat;

        if (i === coins.length - 1) {
            return res.status(200).send({ result: total_fiat.toFixed(2), fiat: FIAT, error: null });
        }
    }
});
app.get('/getPortfolioChart/:days', async (req, res) => {
    const { days } = req.params;
    if (!days || isNaN(days)) return res.status(400).send({ result: '', error: 'No or invalid days specified' });
    
    const chart = await getPortfolioChart(FIAT, days);
    return res.status(200).send({ result: chart, error: null });
});
app.get('/calculateInterestedCoinPrices', async (req, res) => {
    const prices = await calculateInterestedCoinPrices(FIAT);

    return res.status(200).send({ result: prices, error: null });
});
app.get('/getCoinPriceChart/:days/:coin', async (req, res) => {
    const { coin, days } = req.params;
    if (!days || isNaN(days)) return res.status(400).send({ result: '', error: 'No or invalid days specified' });
    if (!coin) return res.status(400).send({ result: '', error: 'No or invalid coin specified' });
    
    const chart = await getCoinPriceChart(coin, FIAT, days);
    return res.status(200).send({ result: chart, error: null });
});
app.post('/addWalletToDatabase', async (req, res) => {
    return res.status(200).send({ result: '', error: 'TODO: no implemented yet' });
});
app.post('/removeWalletFromDatabase', async (req, res) => {
    return res.status(200).send({ result: '', error: 'TODO: no implemented yet' });
});

app.listen(PORT);