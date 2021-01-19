const randomExt = require('random-ext');

const config = {
    stratName: '$lon-aaat-stats',
    gekkoConfig: {
        watch: {
            exchange: 'Binance',
            currency: 'USDT',
            asset: 'BTC'
        },
        daterange: {
            from: '2017-12-21 00:00',
            to: '2020-08-21 00:00'
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

    populationAmt: 4, // Population size, better reduce this for larger data
    // How many completely new units will be added to the population (populationAmt * variation must be a whole number!!)
    variation: 0.5,
    mutateElements: 7, // How many components maximum to mutate at once
    parallelqueries: 4, // How many parallel queries to run at once

    mainObjective: 'profitBatched',
    BATCH_PERIOD_MIN_PROFIT: 0.001, // just any positivity
    USE_FAKE_REPORT: true,

    candleValues: [ 3, 5, 10, 15, 30, 60, 120 ],

    getProperties: () => ({

        candleSize: randomExt.pick(config.candleValues),
        historySize: 480, // just to match warmup 11 days for 1 hr candles

        TAKE_PROFIT: randomExt.float(0.120, 0.003).toFixed(3),
        STOP_LOSS: randomExt.float(0.040, 0.001).toFixed(3),
        CROSS_ATTEMPTS: randomExt.pick([ 1, 2, 10, 100 ]),
        // CROSS_ATTEMPTS: randomExt.integer(12, 1),
        aaat: {
            hiekenAshi: randomExt.pick([true, false]),
            HIGH: randomExt.pick([ 1, 2, 4, 8 ])
        },

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

module.exports = config;
