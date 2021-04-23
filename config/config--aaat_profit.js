const randomExt = require('random-ext');

const config = {
    stratName: '$lon--aaat',
    gekkoConfig: {
        watch: {
            exchange: 'Binance',
            currency: 'BTC',
            asset: 'ETH'
        },

        daterange: {
            from: '2018-01-01 00:00',
            to: '2021-01-01 00:00'
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
    populationAmt: 8,

    // How many completely new units will be added to the population (populationAmt * variation must be a whole number!!)
    variation: 0.5,

    // How many components maximum to mutate at once
    mutateElements: 7,

    // How many parallel queries to run at once
    parallelqueries: 5,

    // Min sharpe to consider in the profitForMinSharpe main objective
    minSharpe: 0.5,
    maxLosses: 0,
    // maxMaxExposure: 3600000 * 24 * 1, // 1 day , 345 600 000‬
    // profit || score || profitForMinSharpe
    // score = ideas? feedback?
    // profit = recommended!
    // profitForMinSharpe = same as profit but sharpe will never be lower than minSharpe
    // profitBatched = min profitable for each month (use with batchBacktest new API) - use G as passive monthly income!
    // mainObjective: 'profit',

    mainObjective: 'profit',

    candleValues: [ 30, 60, 120, 240, 720, 1440 ],
    // candleValues: [ 1440 ],

    getProperties: () => ({

        candleSize: randomExt.pick(config.candleValues),
        historySize: 280, // just to match MAX ATR

        CROSS_ATTEMPTS: randomExt.pick([ 1 ]),
        // CROSS_ATTEMPTS: randomExt.pick([1, 2, 3]),
        aaat: {
            USE_HEIKEN: randomExt.pick([ true, false ]),
            HIGH: randomExt.pick([ 1, 2, 4 ]),
            DEVIATION: parseFloat(randomExt.float(0.03, 0.01).toFixed(2)),
            ON_STEROIDS: randomExt.pick([ true, false ]),
        },

        margin: {
            useShort: randomExt.pick([ true, false ])
            //useShort: true
        },
    })
};

module.exports = config;
