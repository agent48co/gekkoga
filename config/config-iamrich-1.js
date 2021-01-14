const randomExt = require('random-ext');

const configJumpoJimbo = {
    stratName: '$lon-IAmRich-1',
    gekkoConfig: {
        watch: {
            exchange: 'Binance',
            currency: 'USDT',
            asset: 'BTC'
        },

        daterange: {
            from: '2018-12-01 00:00:00',
            // from: '2017-08-30 00:00',
            to: '2019-12-05 20:44:00'
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
    mainObjective: 'profitForMaxTrades',
    // mainObjective: 'profitForLimitedLossesLimitedMaxExposure',

    // candleValues: [ 15, 30, 60 ], // round 1 - small timeframes
    candleValues: [15, 30, 60, 120, 240], // round 1 - small timeframes
    lengthMultiplyers: [1, 4, 16, 24, 96], // round 1 - small timeframes

    getProperties: () => ({
        candleSize: randomExt.pick(configJumpoJimbo.candleValues),
        historySize: 200,

        takeProfit: randomExt.float(1.3, 1.002).toFixed(3),//1.01
        percentBelowMa: randomExt.float(0.1, 0.001).toFixed(3),//0.017,
        bullTrendMa15: randomExt.pick([true, false]),

        aaat: {
            USE_HEIKEN: false,
            // lengthMultiplyeryer: randomExt.pick(configJumpoJimbo.lengthMultiplyers),
            lengthMultiplyer: 4
        },

        // these don't matter:
        rsi: {
            interval: 1,
            low: 29,
            high: 79,
            persistence: 1,
        },
        bbands: {
            TimePeriod: 20,
            NbDevUp: 3,
            NbDevDn: 3
        }
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
