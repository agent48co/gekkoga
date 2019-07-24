const randomExt = require('random-ext');

const configRsi_atr = {
  stratName: 'RSI_Candle_with_ATR-USD_BTC',
  gekkoConfig: {
    watch: {
      exchange: 'GDAX',
      currency: 'USD',
      asset: 'BTC'
    },

//    daterange: 'scan',

    daterange: {
      from: '2019-07-01 00:00',
      to: '2019-07-23 00:00'
    },

    simulationBalance: {
      'asset': 0,
      'currency': 10000
    },

    slippage: 0.05,
    feeTaker: 0.25,
    feeMaker: 0.25,
    feeUsing: 'taker', // maker || taker

  },
  apiUrl: 'http://localhost:4000',

  // Population size, better reduce this for larger data
  populationAmt: 20,

  // How many completely new units will be added to the population (populationAmt * variation must be a whole number!!)
  variation: 0.5,

  // How many components maximum to mutate at once
  mutateElements: 7,

  // How many parallel queries to run at once
  parallelqueries: 5,

  // Min sharpe to consider in the profitForMinSharpe main objective
  minSharpe: 0.5,

  // profit || score || profitForMinSharpe
  // score = ideas? feedback?
  // profit = recommended!
  // profitForMinSharpe = same as profit but sharpe will never be lower than minSharpe
  mainObjective: 'profit',
  // mainObjective: 'profitForMinSharpe',

  // optionally recieve and archive new all time high every new all time high
  notifications: {
    email: {
      enabled: false,
      receiver: 'destination@some.com',
      senderservice: 'gmail',
      sender: 'origin@gmail.com',
      senderpass: 'password',
    },
  },

  // candleValues: [5,10,15,30,60,120,240],

  // candleValues: [14, 60],
  candleValues: [14],
  getProperties: () => ({
//    interval: randomExt.pick(configRsi_atr.candleValues),
    historySize: 100,

    thresholds: {
      ATR_LOW_SELL: 1000,
      ATR_HIGH_BUY: randomExt.integer(350, 30),
      RSI_HIGH_SELL: 70,
      RSI_LOW_BUY: 30,
      RSI_HIGH_SELL_ALWAYS: 75,
      RSI_LOW_BUY_ALWAYS: 15,
      STOP_LOSS_RATIO: 0.99,
      TIMEOUT_EXIT_MINUTES: 120,
      TIMEOUT_EXIT_COEF: 1.01,
    },
    ATR_Period: 14,
    candleSize: randomExt.pick(configRsi_atr.candleValues),
  })
  /*getProperties: () => ({

  historySize: randomExt.integer(100, 20),

  short: randomExt.integer(15,5),
  long: randomExt.integer(40,15),
  signal: randomExt.integer(12,6),

  thresholds: {
    up: randomExt.float(20,0).toFixed(2),
    down: randomExt.float(0,-20).toFixed(2),
    persistence: randomExt.integer(9,0),
  },

  candleSize: randomExt.pick(configRsi_atr.candleValues)
})*/
};

module.exports = configRsi_atr;
