const randomExt = require('random-ext');

const configJumpoJimbo = {
    stratName: '$lon-krown-cave',
    gekkoConfig: {
        watch: {
            exchange: 'Binance',
            currency: 'USDT',
            asset: 'BTC'
        },
        daterange: {
            from: '2020-02-21 00:00',
            to: '2020-03-21 00:00'
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
    populationAmt: 6,

    // How many completely new units will be added to the population (populationAmt * variation must be a whole number!!)
    variation: 0.5,

    // How many components maximum to mutate at once
    mutateElements: 5,

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
    //mainObjective: 'profit',
    mainObjective: 'profitBatched',
    // mainObjective: 'profitForLimitedLossesLimitedMaxExposure',

    //candleValues: [ 60 ],
     candleValues: [ 15, 30 ],

    getProperties: () => ({

        candleSize: randomExt.pick(configJumpoJimbo.candleValues),
        historySize: 280, // just to match warmup 11 days for 1 hr candles
        margin: {
            useShort: randomExt.pick([ true, false ])
        },
        takeProfit: randomExt.float(1.5, 1.003).toFixed(3),
        aaat: {
            USE_HEIKEN: randomExt.pick([ true, false ]),
            sellOnRedThresholdMedium: randomExt.pick([ true, false ]),
            sellOnRedThresholdHigh: randomExt.pick([ true, false ])
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
