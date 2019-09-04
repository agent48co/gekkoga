const randomExt = require('random-ext');

const configRsi_atr = {
  stratName: 'ATR-ADX-Trend',
  gekkoConfig: {
    watch: {
      exchange: 'Poloniex',
      currency: 'USDT',
      asset: 'BTC'
    },

    daterange: {
      from: '2017-06-17 14:09',
      to: '2019-08-26 07:09'
    },

    simulationBalance: {
      'asset': 1,
      'currency': 0
    },

    slippage: 0.05,
    feeTaker: 0.15,
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
  // mainObjective: 'profit',
  mainObjective: 'profitForMinSharpe',

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

/*  candleValues: [15, 30, 45, 60, 120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450, 480, 510, 540,
    570, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1100, 1200, 1330, 1400, 1440 ],*/
    candleValues: [15, 30, 45, 60, 120, 180, 240, 360, 720, 1440 ],
    candleNumbers: [1, 2, 3 ],
    useHeiken: [ true, false ],

  getProperties: () => ({
    historySize: 14,
    CANDLE_NUMBER: randomExt.pick(configRsi_atr.candleNumbers),
    USE_HEIKEN: randomExt.pick(configRsi_atr.useHeiken),
    RSI_BUY_MIN: randomExt.integer(100, 25),
    candleSize: randomExt.pick(configRsi_atr.candleValues)
    // candleSize: randomExt.integer(3000, 60)
  })
};

module.exports = configRsi_atr;
