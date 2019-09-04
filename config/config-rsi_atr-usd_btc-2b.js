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
      from: '2019-06-26 09:21',
      to: '2019-07-26 09:21'
    },

    simulationBalance: {
      'asset': 0,
      'currency': 100
    },

    slippage: 0.05,
    feeMaker: 0.1,// ignored
    feeTaker: 0.2,
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

  candleValues: [14, 60],
  // candleValues: [14],
  timeoutValues: [ 120, 150, 180, 210, 240, 270, 300, 840, 3600 ],
  timeoutValues1: [ 2, 30, 60, 120],

  getProperties: () => ({
    historySize: 14,

    thresholds: {
      ATR_LOW_SELL: randomExt.integer(100, 3),
      ATR_HIGH_BUY: randomExt.integer(40, 10),
      RSI_HIGH_SELL: 70,
      // RSI_HIGH_SELL: randomExt.integer(85, 70),
      // RSI_LOW_BUY: randomExt.integer(32, 25),
      RSI_LOW_BUY: 30,
      RSI_HIGH_SELL_ALWAYS: randomExt.integer(90, 70),
      // RSI_HIGH_SELL_ALWAYS: 75,
      RSI_LOW_BUY_ALWAYS: randomExt.integer(20, 10),
      // RSI_LOW_BUY_ALWAYS: 15,
      STOP_LOSS_RATIO: 0.99,
      TIMEOUT_EXIT_MINUTES: 2,
      // TIMEOUT_EXIT_MINUTES: randomExt.pick(configRsi_atr.timeoutValues1),
      // TIMEOUT_EXIT_MINUTES: randomExt.pick(configRsi_atr.timeoutValues),
      // TIMEOUT_EXIT_COEF: randomExt.float(1.10, 0.90).toFixed(3),
      // TIMEOUT_EXIT_COEF: randomExt.float(1.10, 0.90).toFixed(2),
      TIMEOUT_EXIT_COEF: 1.006,
    },
    ATR_Period: 14,
    candleSize: 1,
    //candleSize: randomExt.pick(configRsi_atr.candleValues),
  })
};

module.exports = configRsi_atr;
