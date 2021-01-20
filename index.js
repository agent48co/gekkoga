const async = require('async');
const nodemailer = require('nodemailer');
const randomExt = require('random-ext');
const rp = require('request-promise');
const { some } = require('bluebird');
const fs = require('fs-extra');
const flat = require('flat');
const util = require('util');

class BatchProfit {
  constructor(props = {}) {
    this.minProfit = -Infinity;          // minimal monthly profit
    this.nonProfitPeriods = Infinity;   // amount of periods with profit less than BATCH_PERIOD_MIN_PROFIT

    Object.assign(this, props);
  }
}

class Ga {

  constructor({ gekkoConfig, stratName, mainObjective, USE_FAKE_REPORT, populationAmt, parallelqueries, minSharpe,
                BATCH_PERIOD_MIN_PROFIT, BATCH_MAX_ALLOWED_NON_PROFIT_PERIODS, maxLosses, maxTrades, maxMaxExposure,
                variation, mutateElements, notifications, getProperties, apiUrl }, configName ) {
    this.configName = configName.replace(/\.js|config\//gi, "");
    this.stratName = stratName;
    this.mainObjective = mainObjective;
    this.USE_FAKE_REPORT = USE_FAKE_REPORT;
    this.getProperties = getProperties;
    this.apiUrl = apiUrl;
    this.sendemail = notifications.email.enabled;
    this.senderservice = notifications.email.senderservice;
    this.sender = notifications.email.sender;
    this.senderpass = notifications.email.senderpass;
    this.receiver = notifications.email.receiver;
    this.currency = gekkoConfig.watch.currency;
    this.asset = gekkoConfig.watch.asset;
    this.previousBestParams = null;
    this.populationAmt = populationAmt;
    this.parallelqueries = parallelqueries;
    this.minSharpe = minSharpe;
    this.BATCH_PERIOD_MIN_PROFIT = BATCH_PERIOD_MIN_PROFIT || -Infinity; // disregard if not found
    this.BATCH_MAX_ALLOWED_NON_PROFIT_PERIODS = BATCH_MAX_ALLOWED_NON_PROFIT_PERIODS || Infinity; // disregard if not found
    this.maxLosses = maxLosses || 0;
    this.maxTrades = maxTrades || 0;
    this.maxMaxExposure = maxMaxExposure;
    this.variation = variation;
    this.mutateElements = mutateElements;
    this.baseConfig = {
      watch: gekkoConfig.watch,
      paperTrader: {
        slippage: gekkoConfig.slippage,
        feeTaker: gekkoConfig.feeTaker,
        feeMaker: gekkoConfig.feeMaker,
        feeUsing: gekkoConfig.feeUsing,
        simulationBalance: gekkoConfig.simulationBalance,
        reportRoundtrips: true,
        enabled: true
      },
      writer: {
        enabled: false,
        logpath: ''
      },
      tradingAdvisor: {
        enabled: true,
        method: this.stratName,
      },
      trader: {
        enabled: false,
      },
      backtest: {
        daterange: gekkoConfig.daterange
      },
      backtestResultExporter: {
        enabled: true,
        writeToDisk: false,
        data: {
          stratUpdates: false,
          roundtrips: false,
          stratCandles: true,
          stratCandleProps: [
            'close',
            'start'
          ],
          trades: false
        }
      },
      performanceAnalyzer: {
        riskFreeReturn: 5,
        enabled: true
      },
      valid: true
    };


  }

  // Checks for, and if present loads old .json parameters
  async loadBreakPoint() {

    const fileName = `./results/${this.configName}-${this.currency}_${this.asset}.json`;
    const exists = fs.existsSync(fileName);

    if(exists){

      console.log('Previous config found, loading...');
      return fs.readFile(fileName, 'utf8').then(JSON.parse);

    }

    return false;

  }

  // Allows queued execution via Promise
  queue(items, parallel, ftc) {

    const queued = [];

    return Promise.all(items.map((item) => {

      const mustComplete = Math.max(0, queued.length - parallel + 1);
      const exec = some(queued, mustComplete).then(() => ftc(item));
      queued.push(exec);

      return exec;

    }));

  }

  // Creates a random gene if prop='all', creates one random property otherwise
  createGene(prop) {
    // Is first generation, and previous props available, load them as a start-point
    if (this.previousBestParams === null || this.runstarted) {
      let properties = flat.flatten(this.getProperties());
      return prop === 'all' ? flat.unflatten(properties) : properties[prop];
    } else if ( this.previousBestParams.parameters && !this.runstarted) {
      this.runstarted = 1;
      let properties = flat.flatten(this.previousBestParams.parameters);
      return prop === 'all' ? flat.unflatten(properties) : properties[prop];
    } else {
      throw Error('Could not resolve a suitable state for previousBestParams');
    }
  }

  // Creates random population from genes
  createPopulation() {
    let population = [];

    for (let i = 0; i < this.populationAmt; i++) {

      population.push(this.createGene('all'));

    }

    return population;
  }

  // Pairs two parents returning two new childs
  crossover(a, b) {

    let len = Object.keys(a).length;
    let crossPoint = randomExt.integer(len - 1, 1);
    let tmpA = {};
    let tmpB = {};
    let currPoint = 0;

    for (let i in a) {

      if (a.hasOwnProperty(i) && b.hasOwnProperty(i)) {

        if (currPoint < crossPoint) {

          tmpA[i] = a[i];
          tmpB[i] = b[i];

        } else {

          tmpA[i] = b[i];
          tmpB[i] = a[i];

        }

      }

      currPoint++;

    }

    return [tmpA, tmpB];
  }

  // Mutates object a at most maxAmount times
  mutate(a, maxAmount) {

    let amt = randomExt.integer(maxAmount, 0);
    // flatten, mutate, return unflattened object
    let flattened = flat.flatten(a);
    let allProps = Object.keys(flattened);

    for (let i = 0; i < amt; i++) {
      let position = randomExt.integer(Object.keys(allProps).length - 1, 0);
      let prop = allProps[position];
      flattened[prop] = this.createGene(prop);
    }

    return flat.unflatten(flattened);
  }

  // For the given population and fitness, returns new population and max score
  runEpoch(population, populationProfits, populationSharpes, populationLosses, populationScores, populationExposures, populationTrades, populationMaxExposes, populationBatchProfits) {
    let selectionProb = [];
    let fitnessSum = 0;
    let maxFitness = [0, 0, 0, 0, 0, 0, 0, 0, new BatchProfit()];

    for (let i = 0; i < this.populationAmt; i++) {

      if (this.mainObjective === 'score') {

        if (populationProfits[i] < 0 && populationSharpes[i] < 0) {

          populationScores[i] = (populationProfits[i] * populationSharpes[i]) * -1;

        } else {

          populationScores[i] = Math.tanh(populationProfits[i] / 3) * Math.tanh(populationSharpes[i] / 0.25);

        }

        if (populationScores[i] > maxFitness[2]) {

          maxFitness = [populationProfits[i], populationSharpes[i], populationScores[i], i];

        }

      } else if (this.mainObjective === 'profit') {

        if (populationProfits[i] > maxFitness[0]) {

          maxFitness = [populationProfits[i], populationSharpes[i], populationScores[i], i];

        }

      }  else if (this.mainObjective === 'profitBatched') {

        if (
          populationProfits[i] > maxFitness[0]
            && populationBatchProfits[i].minProfit >= this.BATCH_PERIOD_MIN_PROFIT
            && populationBatchProfits[i].nonProfitPeriods <= maxFitness[8].nonProfitPeriods
            && populationBatchProfits[i].nonProfitPeriods <= this.BATCH_MAX_ALLOWED_NON_PROFIT_PERIODS
            ) {
          maxFitness = [populationProfits[i], populationSharpes[i], populationScores[i], i, populationLosses[i]
            , populationExposures[i], populationTrades[i], populationMaxExposes[i], populationBatchProfits[i]];
          console.error(`profitBatched:: new maxFitness: ${ JSON.stringify(maxFitness) } (BATCH_PERIOD_MIN_PROFIT: ${ 
            this.BATCH_PERIOD_MIN_PROFIT }), (BATCH_MAX_ALLOWED_NON_PROFIT_PERIODS: ${ this.BATCH_MAX_ALLOWED_NON_PROFIT_PERIODS })`)
        }

      } else if (this.mainObjective === 'profitForMinSharpe') {

        if (populationProfits[i] > maxFitness[0] && populationSharpes[i] >= this.minSharpe) {

          maxFitness = [populationProfits[i], populationSharpes[i], populationScores[i], i];

        }

      } else if (this.mainObjective === 'profitForMaxTrades') {

        if (populationProfits[i] > maxFitness[ 0 ] && populationTrades[i] >= maxFitness[ 6 ]) {

          maxFitness = [populationProfits[i], populationSharpes[i], populationScores[i], i, populationLosses[i]
            , populationExposures[i], populationTrades[i], populationMaxExposes[i]];

        }

      } else if (this.mainObjective === 'profitForMaxTradesLimitedLosses') {

        if (populationProfits[i] > maxFitness[0] && populationLosses[i] <= this.maxLosses) {

          maxFitness = [populationProfits[i], populationSharpes[i], populationScores[i], i, populationLosses[i], populationExposures[i], populationTrades[i]];

        }

      } else if (this.mainObjective === 'profitForLimitedLossesLimitedMaxExposure') {

        if (populationProfits[i] > maxFitness[0] && populationLosses[i] <= this.maxLosses && populationMaxExposes[i] <= this.maxMaxExposure) {

          maxFitness = [populationProfits[i], populationSharpes[i], populationScores[i], i, populationLosses[i]
            , populationExposures[i], populationTrades[i], populationMaxExposes[i]];

        }

      }

      fitnessSum += populationProfits[i];

    }

    if (fitnessSum === 0) {

      for (let j = 0; j < this.populationAmt; j++) {

        selectionProb[j] = 1 / this.populationAmt;

      }

    } else {
      for (let j = 0; j < this.populationAmt; j++) {
        selectionProb[j] = populationProfits[j] / fitnessSum;
      }

    }

    let newPopulation = [];

    while (newPopulation.length < this.populationAmt * (1 - this.variation)) {

      let a, b;
      let selectedProb = randomExt.float(1, 0);

      for (let k = 0; k < this.populationAmt; k++) {

        selectedProb -= selectionProb[k];

        if (selectedProb <= 0) {

          a = population[k];
          break;

        }

      }
      selectedProb = randomExt.float(1, 0);

      for (let k = 0; k < this.populationAmt; k++) {

        selectedProb -= selectionProb[k];

        if (selectedProb <= 0) {

          b = population[k];
          break;

        }

      }

      let res = this.crossover(this.mutate(a, this.mutateElements), this.mutate(b, this.mutateElements));
      newPopulation.push(res[0]);
      newPopulation.push(res[1]);

    }

    for (let l = 0; l < this.populationAmt * this.variation; l++) {

      newPopulation.push(this.createGene('all'));

    }

    return [newPopulation, maxFitness];
  }

  getConfig(data) {

    const conf = Object.assign({}, this.baseConfig);

    conf[this.stratName] = Object.keys(data).reduce((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {});

    Object.assign(conf.tradingAdvisor, {
      candleSize: data.candleSize,
      historySize: data.historySize
    });

    return conf;

  }

  // Calls api for every element in testSeries and returns gain for each
  async fitnessApi(testsSeries) {

    const numberOfParallelQueries = this.parallelqueries;

    const results = await this.queue(testsSeries, numberOfParallelQueries, async (data) => {

      const outconfig = this.getConfig(data);

      let body, url;
      if (this.mainObjective === 'profitBatched') {
        // batched report:
        outconfig.batch = { noBigData: true, synchronous: true, batchPeriodProfitThreshold: this.BATCH_PERIOD_MIN_PROFIT };
        url = `${this.apiUrl}/api/batchBacktest`;
      } else {
        url = `${this.apiUrl}/api/backtest`;
      }
      body = await rp.post({
        url,
        json: true,
        body: outconfig,
        headers: {'Content-Type': 'application/json'},
        timeout: 3600000
      });
      let result = { profit: 0, metrics: false, losses: 0, exposure: 0, trades: 0, maxExposure: 0, batchProfit: 0 };
      if (this.USE_FAKE_REPORT) {
        result = {
          profit: body.fakeReport.total,
          batchProfit: new BatchProfit({
            minProfit: body.fakeReport.stats.map(s => s.profitTot).reduce((min, c) => min = c < min ? c: min, Infinity),
            nonProfitPeriods: body.fakeReport.stats.filter(s => s.profitTot < this.BATCH_PERIOD_MIN_PROFIT).length,
          })
        };
      } else {
        // These properties will be outputted every epoch, remove property if not needed
        const properties = ['balance', 'profit', 'sharpe', 'losses', 'market', 'relativeProfit', 'yearlyProfit',
          'relativeYearlyProfit', 'startPrice', 'endPrice', 'trades', 'exposure', 'maxExposure', 'minProfit'];
        const report = body.performanceReport;
        if (report) {

          let picked = properties.reduce((o, k) => {

            o[k] = report[k];

            return o;

          }, {});

          result = {
            profit: body.performanceReport.profit,
            sharpe: body.performanceReport.sharpe,
            losses: body.performanceReport.losses,
            metrics: picked,
            exposure: body.performanceReport.exposure,
            trades: body.performanceReport.trades,
            maxExposure: body.performanceReport.maxExposure,
            batchProfit: new BatchProfit({
              minProfit: body.performanceReport.minProfit,
              nonProfitPeriods: body.performanceReport.periodsLoss,
            }),
          };
        }
      }

      return result;

    });

    let scores = [];
    let profits = [];
    let sharpes = [];
    let losses = [];
    let trades = [];
    let exposures = [];
    let maxExposures = [];
    let populationBatchProfits = [];
    let otherMetrics = [];

    for (let i in results) {

      if (results.hasOwnProperty(i)) {

        scores.push(results[i]['profit'] * results[i]['sharpe']);
        profits.push(results[i]['profit']);
        sharpes.push(results[i]['sharpe']);
        losses.push(results[i]['losses']);
        trades.push(results[i]['trades']);
        exposures.push(results[i]['exposure']);
        maxExposures.push(results[i]['maxExposure']);
        populationBatchProfits.push(results[i]['batchProfit']);
        otherMetrics.push(results[i]['metrics']);

      }

    }

    return { scores, profits, sharpes, losses, trades, exposures, maxExposures, otherMetrics, populationBatchProfits };

  }

  async run() {
    // Check for old break point
    const loaded_config = await this.loadBreakPoint();
    let population = this.createPopulation();
    let epochNumber = 0;
    let populationScores;
    let populationProfits;
    let populationSharpes;
    let populationLosses;
    let populationTrades;
    let populationExposures;
    let populationMaxExposures;
    let populationBatchProfits = new BatchProfit(); // only for Batched BT!
    let otherPopulationMetrics;
    let allTimeMaximum = {
      parameters: {},
      score: -5,
      profit: -5,
      batchProfit: new BatchProfit(),
      sharpe: -5,
      losses: -5,
      exposure: -5,
      maxExposure: -5,
      trades: -5,
      epochNumber: 0,
      otherMetrics: {}
    };

    if (loaded_config) {

      console.log(`Loaded previous config from ${this.configName}-${this.currency}_${this.asset}.json`);
      this.previousBestParams = loaded_config;

      epochNumber = this.previousBestParams.epochNumber;
      populationScores = this.previousBestParams.score;
      populationProfits = this.previousBestParams.profit;
      populationBatchProfits = new BatchProfit(this.previousBestParams.batchProfit);
      populationSharpes = this.previousBestParams.sharpe;
      populationLosses = this.previousBestParams.losses;
      populationExposures = this.previousBestParams.exposure;
      otherPopulationMetrics = this.previousBestParams.otherMetrics;
      allTimeMaximum = {
        parameters: this.previousBestParams.parameters,
        score: this.previousBestParams.score,
        profit: this.previousBestParams.profit,
        batchProfit: new BatchProfit(this.previousBestParams.batchProfit),
        sharpe: this.previousBestParams.sharpe,
        losses: this.previousBestParams.losses,
        exposure: this.previousBestParams.exposure,
        trades: this.previousBestParams.trades,
        epochNumber: this.previousBestParams.epochNumber,
        otherMetrics: this.previousBestParams.otherMetrics
      };

      console.log('Resuming previous run...');

    } else {

      console.log('No previous run data, starting from scratch!');

    }

    console.log(`Starting GA with epoch populations of ${this.populationAmt}, running ${this.parallelqueries} units at a time!`);

    while (1) {

      const startTime = new Date().getTime();
      const res = await this.fitnessApi(population);

      populationScores = res.scores;
      populationProfits = res.profits;
      populationSharpes = res.sharpes;
      populationLosses = res.losses;
      populationTrades = res.trades;
      populationExposures = res.exposures;
      populationMaxExposures = res.maxExposures;
      populationBatchProfits = res.populationBatchProfits;
      otherPopulationMetrics = res.otherMetrics;

      let endTime = new Date().getTime();
      epochNumber++;
      let results = this.runEpoch(population, populationProfits, populationSharpes, populationLosses, populationScores
        , populationExposures, populationTrades, populationMaxExposures, populationBatchProfits);
      let newPopulation = results[0];
      let maxResult = results[1];
      let score = maxResult[2];
      let profit = maxResult[0];
      let sharpe = maxResult[1];
      let losses = maxResult[4];
      let exposure = maxResult[5];
      let maxExposure = maxResult[7];
      let trades = maxResult[6];
      let position = maxResult[3];
      let batchProfit = maxResult[8];

      this.notifynewhigh = false;
      if (this.mainObjective === 'score') {
        if (score >= allTimeMaximum.score) {
          this.notifynewhigh = true;
          allTimeMaximum.parameters = population[position];
          allTimeMaximum.otherMetrics = otherPopulationMetrics[position];
          allTimeMaximum.score = score;
          allTimeMaximum.profit = profit;
          allTimeMaximum.sharpe = sharpe;
          allTimeMaximum.epochNumber = epochNumber;

        }
      } else if (this.mainObjective === 'profit') {
        if (profit >= allTimeMaximum.profit) {
          this.notifynewhigh = true;
          allTimeMaximum.parameters = population[position];
          allTimeMaximum.otherMetrics = otherPopulationMetrics[position];
          allTimeMaximum.score = score;
          allTimeMaximum.profit = profit;
          allTimeMaximum.sharpe = sharpe;
          allTimeMaximum.losses = losses;
          allTimeMaximum.epochNumber = epochNumber;

        }
      } else if (this.mainObjective === 'profitBatched') {
        if (
          profit >= allTimeMaximum.profit
            && batchProfit.nonProfitPeriods <= allTimeMaximum.batchProfit.nonProfitPeriods
            && batchProfit.nonProfitPeriods <= this.BATCH_MAX_ALLOWED_NON_PROFIT_PERIODS
            && batchProfit.minProfit >= this.BATCH_PERIOD_MIN_PROFIT
        ) {

          this.notifynewhigh = true;
          allTimeMaximum.parameters = population[position];
          allTimeMaximum.otherMetrics = otherPopulationMetrics[position];
          allTimeMaximum.score = score;
          allTimeMaximum.profit = profit;
          allTimeMaximum.batchProfit = batchProfit;
          allTimeMaximum.sharpe = sharpe;
          allTimeMaximum.losses = losses;
          allTimeMaximum.epochNumber = epochNumber;

        }
      } else if (this.mainObjective === 'profitForMinSharpe') {
        if (profit >= allTimeMaximum.profit && sharpe >= this.minSharpe) {
          this.notifynewhigh = true;
          allTimeMaximum.parameters = population[position];
          allTimeMaximum.otherMetrics = otherPopulationMetrics[position];
          allTimeMaximum.score = score;
          allTimeMaximum.profit = profit;
          allTimeMaximum.sharpe = sharpe;
          allTimeMaximum.losses = losses;
          allTimeMaximum.epochNumber = epochNumber;
        }
      } else if (this.mainObjective === 'profitForMaxTrades') {
        if (profit >= allTimeMaximum.profit && sharpe >= allTimeMaximum.trades) {
          this.notifynewhigh = true;
          allTimeMaximum.parameters = population[position];
          allTimeMaximum.otherMetrics = otherPopulationMetrics[position];
          allTimeMaximum.score = score;
          allTimeMaximum.profit = profit;
          allTimeMaximum.sharpe = sharpe;
          allTimeMaximum.losses = losses;
          allTimeMaximum.trades = trades;
          allTimeMaximum.epochNumber = epochNumber;
        }
      } else if (this.mainObjective === 'profitForMaxTradesLimitedLosses') {
        if (profit >= allTimeMaximum.profit && losses <= this.maxLosses) {
          this.notifynewhigh = true;
          allTimeMaximum.parameters = population[position];
          allTimeMaximum.otherMetrics = otherPopulationMetrics[position];
          allTimeMaximum.score = score;
          allTimeMaximum.profit = profit;
          allTimeMaximum.sharpe = sharpe;
          allTimeMaximum.losses = losses;
          allTimeMaximum.exposure = exposure;
          allTimeMaximum.trades = trades;
          allTimeMaximum.epocLosseshNumber = epochNumber;

        }
      } else if (this.mainObjective === 'profitForLimitedLossesLimitedMaxExposure') {
        if (profit >= allTimeMaximum.profit && losses <= this.maxLosses && maxExposure <= this.maxMaxExposure) {
          console.error(`allTimeMax: profit: ${profit}, losses: ${losses}, maxExposure: ${ maxExposure}, this.maxLosses: ${this.maxLosses}, this.maxMaxExposure: ${this.maxMaxExposure}, `)
          this.notifynewhigh = true;
          allTimeMaximum.parameters = population[position];
          allTimeMaximum.otherMetrics = otherPopulationMetrics[position];
          allTimeMaximum.score = score;
          allTimeMaximum.profit = profit;
          allTimeMaximum.sharpe = sharpe;
          allTimeMaximum.losses = losses;
          allTimeMaximum.exposure = exposure;
          allTimeMaximum.maxExposure = maxExposure;
          allTimeMaximum.trades = trades;
          allTimeMaximum.epochNumber = epochNumber;

        }
      }

      console.log(`
    --------------------------------------------------------------
    Epoch number: ${epochNumber}
    Time it took (seconds): ${(endTime - startTime) / 1000}
    Max score: ${score}
    Max profit: ${profit} ${this.currency}
    Max batch profit: ${ JSON.stringify(batchProfit) }
    Max sharpe: ${sharpe}
    Max profit position: ${position}
    Max parameters:
    `,
        util.inspect(population[position], false, null),
        `
    Other metrics:
    `,
        otherPopulationMetrics[position]);

      // Prints out the whole population with its fitness,
      // useful for finding properties that make no sense and debugging
      // for(let element in population){
      //
      //     console.log('Fitness: '+populationProfits[element]+' Properties:');
      //     console.log(population[element]);
      //
      // }

      console.log(`
    --------------------------------------------------------------
    Global Maximums:
    Score: ${allTimeMaximum.score}
    Profit: ${allTimeMaximum.profit} ${this.currency}
    Batch Profit: ${ JSON.stringify(allTimeMaximum.batchProfit) }
    Sharpe: ${allTimeMaximum.sharpe}
    Losses: ${allTimeMaximum.losses}
    MaxExposure: ${allTimeMaximum.maxExposure}
    parameters: \n\r`,
        util.inspect(allTimeMaximum.parameters, false, null),
        `
    Global maximum so far:
    `,
        allTimeMaximum.otherMetrics,
        `
    --------------------------------------------------------------
    `);

      // store in json
      const json = JSON.stringify(allTimeMaximum);
      //await fs.writeFile(`./results/${this.configName}-${this.currency}_${this.asset}.json`, json, 'utf8').catch(err => console.log(err) );

      const configId = `${this.configName}-${this.currency}_${this.asset}`;
      process.send && process.send({results: otherPopulationMetrics[position], input: population[position], configId: configId});
      await fs.writeFile(`./results/${configId}.json`, json, 'utf8').catch(err => console.log(err) );

      if (this.sendemail && this.notifynewhigh) {
        var transporter = nodemailer.createTransport({
          service: this.senderservice,
          auth: {
            user: this.sender,
            pass: this.senderpass
          }
        });
        var mailOptions = {
          from: this.sender,
          to: this.receiver,
          subject: `Profit: ${allTimeMaximum.profit} ${this.currency}`,
          text: json
        };
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
      }


      population = newPopulation;

    }

    console.log(`Finished!
  All time maximum:
  ${allTimeMaximum}`);

  }

}


module.exports = Ga;
