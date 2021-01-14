const randomExt = require('random-ext');

const configJumpoJimbo = {
    stratName: '$lon-MM',
    gekkoConfig: {
        watch: {
            exchange: 'Binance',
            currency: 'USDT',
            asset: 'BTC'
        },

        daterange: {
            from: '2018-08-08 15:39',
            to: '2019-11-08 15:39'
        },

        simulationBalance: {
            'asset': 0,
            'currency': 100
        },

        slippage: 0.05,
        feeTaker: 0.10,
        feeMaker: 0.10,
        feeUsing: 'taker', // maker || taker
    },
    apiUrl: 'http://localhost:4000',

    // Population size, better reduce this for larger data
    populationAmt: 10,

    // How many completely new units will be added to the population (populationAmt * variation must be a whole number!!)
    variation: 0.5,

    // How many components maximum to mutate at once
    mutateElements: 7,

    // How many parallel queries to run at once
    parallelqueries: 3,

    // Min sharpe to consider in the profitForMinSharpe main objective
    minSharpe: 0.5,
    maxLosses: 0,
    maxMaxExposure: 3600000 * 24 * 1, // 1 day , 345 600 000‬
    // profit || score || profitForMinSharpe
    // score = ideas? feedback?
    // profit = recommended!
    // profitForMinSharpe = same as profit but sharpe will never be lower than minSharpe
    // mainObjective: 'profit',
    mainObjective: 'profitForLimitedLossesLimitedMaxExposure',

    // candleValues: [ 15, 30, 60 ], // round 1 - small timeframes
    candleValues: [ 15, 30, 60, 120, 240, 1440 ], // round 1 - small timeframes

    getProperties: () => ({
        candleSize: randomExt.pick(configJumpoJimbo.candleValues),
        historySize: 200,

        // trailingStop: randomExt.integer(30, 1),
        trailingStop: 100,
        THRESHOLD:  2.4,
        // THRESHOLD:  randomExt.float(2.0, 1.2).toFixed(2),
        UNDERVALUE: randomExt.float(0.99, 0.5).toFixed(2),
        TAKE_PROFIT: randomExt.float(1.05, 1.003).toFixed(3),
        // TIMEOUT_MINUTES: 1440 * 100 // 15min - 100 days
        TIMEOUT_MINUTES: randomExt.integer(1440 * 2 * 4, 15) // 15min - 4 days
    }),
    // not used:
    notifications: {
        email: {
            enabled: false,
            receiver: 'destination@some.com',
            senderservice: 'gmail',
            sender: 'origin@gmail.com',
            senderpass: 'password',
        },
    }
};

module.exports = configJumpoJimbo;
