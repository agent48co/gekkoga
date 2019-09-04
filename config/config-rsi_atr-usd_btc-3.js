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
      from: '2019-04-23 13:00',
      to: '2019-07-23 13:00'
    },

    simulationBalance: {
      'asset': 1,
      'currency': 0
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

  candleValues: [14, 60],
  // candleValues: [14],
  timeoutValues: [ 120, 150, 180, 210, 240, 270, 300, 840, 3600 ],

  getProperties: () => ({
    historySize: 10,

    thresholds: {
      ATR_LOW_SELL: randomExt.integer(270, 50),
      ATR_HIGH_BUY: randomExt.integer(350, 30),
      RSI_HIGH_SELL: 70,
      RSI_LOW_BUY: 30,
      RSI_HIGH_SELL_ALWAYS: randomExt.integer(90, 70),
      // RSI_HIGH_SELL_ALWAYS: 75,
      RSI_LOW_BUY_ALWAYS: randomExt.integer(20, 10),
      // RSI_LOW_BUY_ALWAYS: 15,
      STOP_LOSS_RATIO: 0.99,
      TIMEOUT_EXIT_MINUTES: randomExt.pick(configRsi_atr.timeoutValues),
      TIMEOUT_EXIT_COEF: randomExt.float(1.10, 0.90).toFixed(2),
      // TIMEOUT_EXIT_COEF: 1.01,
    },
    ATR_Period: 14,
    candleSize: randomExt.pick(configRsi_atr.candleValues),
  })
};

module.exports = configRsi_atr;
