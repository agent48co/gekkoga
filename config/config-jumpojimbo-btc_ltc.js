const randomExt = require('random-ext');

const configJumpoJimbo = {
  stratName: 'JumpoJimbo',
  gekkoConfig: {
    watch: {
      exchange: 'Binance',
      currency: 'BTC',
      asset: 'LTC'
    },

    daterange: {
      from: '2018-01-01 00:04',
      to: '2019-08-30 21:43:00'
    },

    simulationBalance: {
      'asset': 0,
      'currency': 1
    },

    slippage: 0.05,
    feeTaker: 0.10,
    feeMaker: 0.10,
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
  // mainObjective: 'profitForMaxTradesMinLosses',

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
  dipTimeouts: [60, 120, 180, 240, 360, 720, 1440, 1440 * 2, 1440 * 3, 1440 * 4 ],

  candleValues: [ 1 ],

  getProperties: () => ({
    candleSize: randomExt.pick(configJumpoJimbo.candleValues),

    historySize: 14,
    RSI_HIGH:  randomExt.integer(90, 50),
    RSI_LOW:  randomExt.integer(50, 10),
    DIP_TIMEOUT: randomExt.pick(configJumpoJimbo.dipTimeouts),
    NATR_MIN: randomExt.float(2.10, 0.10).toFixed(1),
    TAKE_PROFIT: randomExt.float(1.09, 1.002).toFixed(3)
  })
};

module.exports = configJumpoJimbo;
