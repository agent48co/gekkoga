const randomExt = require('random-ext');
const INFINITY_SERIALIZABLE = require('../index').INFINITY_SERIALIZABLE;

const configJumpoJimbo = {
    stratName: '$lon-turtles',
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

    mainObjective: 'profitBatched',
    BATCH_SIZE: '1 year',
    BATCH_PERIOD_MIN_PROFIT: 60, // use -1000000 to disregard
    BATCH_MAX_ALLOWED_NON_PROFIT_PERIODS: INFINITY_SERIALIZABLE, //1000000 - disregarding

    candleValues: [ 60, 120, 240, 720, 1440 ],
    // candleValues: [ 120 ],

    getProperties: () => ({

        candleSize: randomExt.pick(configJumpoJimbo.candleValues),
        historySize: 50, // just to match MAX ATR

        enterFast: randomExt.integer(30, 10),
        exitFast: randomExt.integer(20, 1),
        enterSlow: randomExt.integer(95, 35),
        exitSlow: randomExt.integer(50, 1),

        useAtrStop: true,
        useTrailingAtrStop: true,
        atrPeriod: randomExt.integer(50, 25),
        atrStop: randomExt.integer(40, 2),

        hiekenAshi: randomExt.pick([ true, false ]),
        margin: {
            //useShort: randomExt.pick([ true, false ])
            useShort: true
        },
        // BACKTEST_TAKE_PROFIT: 0.05,
        BACKTEST_TAKE_PROFIT: randomExt.float(0.99, 0.01).toFixed(2),
    })
};

module.exports = configJumpoJimbo;
