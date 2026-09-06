import type {
  HistoricalMarketData
} from "./yahooFinance.js";

export function calculateAverageVolume(
  history: HistoricalMarketData[],
  period: number = 20
): number {

  const recentData =
    history.slice(-period);

  if (recentData.length === 0) {
    return 0;
  }

  const totalVolume =
    recentData.reduce(
      (sum, day) => sum + day.volume,
      0
    );

  return totalVolume / recentData.length;
}

export function calculateVolumeRatio(
  currentVolume: number,
  averageVolume: number
): number {

  if (averageVolume <= 0) {
    return 0;
  }

  return currentVolume / averageVolume;
}


export function calculateDailyReturns(
  history: HistoricalMarketData[]
): number[] {

  const returns: number[] = [];

  for (let i = 1; i < history.length; i++) {

    const previousClose =
      history[i - 1].close;

    const currentClose =
      history[i].close;

    if (previousClose <= 0) {
      continue;
    }

    const dailyReturn =
      ((currentClose - previousClose) / previousClose) * 100;

    returns.push(dailyReturn);
  }

  return returns;
}

export function calculateStandardDeviation(
  values: number[]
): number {

  if (values.length === 0) {
    return 0;
  }

  const mean =
    values.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length;

  const squaredDifferences =
    values.map(
      value => Math.pow(value - mean, 2)
    );

  const variance =
    squaredDifferences.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length;

  return Math.sqrt(variance);
}

export function calculateVolatility(
  history: HistoricalMarketData[]
): number {

  const returns =
    calculateDailyReturns(history);

  return calculateStandardDeviation(
    returns
  );
}


export function calculateVolatilityChange(
  history: HistoricalMarketData[],
  recentPeriod: number = 5,
  baselinePeriod: number = 20
): number {

  if (
    history.length <
    recentPeriod + baselinePeriod
  ) {
    return 0;
  }

  const recentHistory =
    history.slice(-recentPeriod);

  const baselineHistory =
    history.slice(
      -(recentPeriod + baselinePeriod),
      -recentPeriod
    );

  const recentVolatility =
    calculateVolatility(recentHistory);

  const baselineVolatility =
    calculateVolatility(baselineHistory);

  if (baselineVolatility === 0) {
    return 0;
  }

  return (
    (recentVolatility - baselineVolatility) /
    baselineVolatility
  ) * 100;
}




/* ========================================
   SIMPLE MOVING AVERAGE
======================================== */

export function calculateSMA(
  history: HistoricalMarketData[],
  period: number
): number | null {

  if (history.length < period) {
    return null;
  }

  const recentData =
    history.slice(-period);

  const total =
    recentData.reduce(
      (sum, day) =>
        sum + day.close,
      0
    );

  return total / recentData.length;
}


/* ========================================
   RSI
======================================== */

export function calculateRSI(
  history: HistoricalMarketData[],
  period: number = 14
): number | null {

  if (
    history.length <
    period + 1
  ) {
    return null;
  }


  const recentData =
    history.slice(
      -(period + 1)
    );


  let totalGain = 0;

  let totalLoss = 0;


  for (
    let i = 1;
    i < recentData.length;
    i++
  ) {

    const change =
      recentData[i].close -
      recentData[i - 1].close;


    if (change > 0) {

      totalGain += change;

    } else {

      totalLoss +=
        Math.abs(change);

    }

  }


  const averageGain =
    totalGain / period;

  const averageLoss =
    totalLoss / period;


  if (averageLoss === 0) {
    return 100;
  }


  const rs =
    averageGain / averageLoss;


  const rsi =
    100 -
    100 / (1 + rs);


  return Number(
    rsi.toFixed(2)
  );
}


/* ========================================
   SUPPORT / RESISTANCE
======================================== */

export function calculateSupportResistance(
  history: HistoricalMarketData[],
  period: number = 60
): {

  support: number | null;

  resistance: number | null;

} {

  if (history.length === 0) {

    return {

      support: null,

      resistance: null

    };

  }


  const recentData =
    history.slice(-period);


  const lows =
    recentData.map(
      day => day.low
    );


  const highs =
    recentData.map(
      day => day.high
    );


  const support =
    Math.min(...lows);


  const resistance =
    Math.max(...highs);


  return {

    support,

    resistance

  };

}


/* ========================================
   MOVING AVERAGE SERIES
======================================== */

/*
 * This is useful for Recharts.
 *
 * It creates a moving average
 * for every history point.
 */

export function calculateSMASeries(
  history: HistoricalMarketData[],
  period: number
): (number | null)[] {

  return history.map(
    (_day, index) => {

      if (
        index <
        period - 1
      ) {
        return null;
      }


      const slice =
        history.slice(
          index - period + 1,
          index + 1
        );


      const total =
        slice.reduce(
          (sum, item) =>
            sum + item.close,
          0
        );


      return total / period;

    }
  );

}

