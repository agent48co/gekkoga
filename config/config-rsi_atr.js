const randomExt = require('random-ext');

const configRsi_atr = {
  stratName: 'RSI_Candle_with_ATR',
  gekkoConfig: {
    watch: {
      exchange: 'poloniex',
      currency: 'btc',
      asset: 'ltc'
    },

//    daterange: 'scan',

    daterange: {
      from: '2019-07-04 00:00',
      to: '2019-07-05 00:00'
    },

    simulationBalance: {
      'asset': 0,
      'currency': 1
    },

    slippage: 0.05,
    feeTaker: 0.25,
    feeMaker: 0.15,
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

  candleValues: [1],
  getProperties: () => ({
    interval: 10,

    historySize: 14,

    //short: randomExt.integer(15,5),
    //long: randomExt.integer(40,15),
    //signal: randomExt.integer(12,6),

    thresholds: {
      // ATR_LOW_SELL: 0.000032,
      ATR_LOW_SELL: Number.parseFloat(randomExt.float(0.000053, 0.000010).toFixed(6)),
      // ATR_HIGH_BUY: 0.000036,
      ATR_HIGH_BUY: Number.parseFloat(randomExt.float(0.000060, 0.000014).toFixed(6)),
      RSI_HIGH_SELL: randomExt.integer(65, 45),
      // RSI_LOW_BUY: 30,
      RSI_LOW_BUY: randomExt.integer(40, 20),
      RSI_HIGH_SELL_ALWAYS: 75,
      STOP_LOSS_RATIO: 0.99
    },
    // candleSize: randomExt.pick(configRsi_atr.candleValues),
    candleSize: 1
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
