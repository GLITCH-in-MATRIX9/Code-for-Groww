
import {
  getStockQuote,
  getHistoricalMarketData
} from "../marketData/yahooFinance.js";

import {
  calculateAverageVolume,
  calculateVolumeRatio,
  calculateVolatility,
  calculateVolatilityChange,
  calculateSMA,
  calculateRSI,
  calculateSupportResistance,
  calculateSMASeries
} from "../marketData/marketMetrics.js";


/* ========================================
   TYPES
======================================== */

export interface StockDashboardHistoryPoint {

  date: string;

  open: number;

  high: number;

  low: number;

  close: number;

  volume: number;

  sma20: number | null;

  sma50: number | null;

}


export interface StockDashboardData {

  symbol: string;

  companyName: string;

  price: number;

  previousClose: number;

  priceChange: number;

  volume: number;

  averageVolume: number;

  volumeRatio: number;

  volatility: number;

  volatilityChange: number;

  currency: string;

  history: StockDashboardHistoryPoint[];

  indicators: {

    sma20: number | null;

    sma50: number | null;

    sma200: number | null;

    rsi: number | null;

    support: number | null;

    resistance: number | null;

  };

}


/* ========================================
   GET STOCK DASHBOARD
======================================== */

export async function getStockDashboard(
  symbol: string
): Promise<StockDashboardData> {

  /*
   * ----------------------------------------
   * FETCH DATA
   * ----------------------------------------
   */

  const [
    quote,
    history
  ] =
    await Promise.all([

      getStockQuote(symbol),

      getHistoricalMarketData(
        symbol,
        365
      )

    ]);


  /*
   * ----------------------------------------
   * VOLUME METRICS
   * ----------------------------------------
   */

  const averageVolume =
    calculateAverageVolume(
      history,
      20
    );


  const volumeRatio =
    calculateVolumeRatio(
      quote.volume,
      averageVolume
    );


  /*
   * ----------------------------------------
   * VOLATILITY
   * ----------------------------------------
   */

  const volatility =
    calculateVolatility(
      history.slice(-30)
    );


  const volatilityChange =
    calculateVolatilityChange(
      history,
      5,
      20
    );


  /*
   * ----------------------------------------
   * MOVING AVERAGES
   * ----------------------------------------
   */

  const sma20 =
    calculateSMA(
      history,
      20
    );


  const sma50 =
    calculateSMA(
      history,
      50
    );


  const sma200 =
    calculateSMA(
      history,
      200
    );


  /*
   * ----------------------------------------
   * RSI
   * ----------------------------------------
   */

  const rsi =
    calculateRSI(
      history,
      14
    );


  /*
   * ----------------------------------------
   * SUPPORT / RESISTANCE
   * ----------------------------------------
   */

  const {
    support,
    resistance
  } =
    calculateSupportResistance(
      history,
      60
    );


  /*
   * ----------------------------------------
   * CHART SMA SERIES
   * ----------------------------------------
   */

  const sma20Series =
    calculateSMASeries(
      history,
      20
    );


  const sma50Series =
    calculateSMASeries(
      history,
      50
    );


  /*
   * ----------------------------------------
   * FORMAT CHART DATA
   * ----------------------------------------
   */

  const formattedHistory =
    history.map(
      (day, index) => ({

        date:
          new Intl.DateTimeFormat(
            "en-US",
            {
              month: "short",
              day: "numeric"
            }
          ).format(day.date),

        open:
          day.open,

        high:
          day.high,

        low:
          day.low,

        close:
          day.close,

        volume:
          day.volume,

        sma20:
          sma20Series[index],

        sma50:
          sma50Series[index]

      })
    );


  /*
   * ----------------------------------------
   * RETURN DASHBOARD
   * ----------------------------------------
   */

  return {

    symbol:
      quote.symbol,

    companyName:
      quote.companyName,

    price:
      quote.price,

    previousClose:
      quote.previousClose,

    priceChange:
      quote.priceChange,

    volume:
      quote.volume,

    averageVolume:
      Math.round(
        averageVolume
      ),

    volumeRatio:
      Number(
        volumeRatio.toFixed(2)
      ),

    volatility:
      Number(
        volatility.toFixed(2)
      ),

    volatilityChange:
      Number(
        volatilityChange.toFixed(2)
      ),

    currency:
      quote.currency,

    history:
      formattedHistory,

    indicators: {

      sma20,

      sma50,

      sma200,

      rsi,

      support,

      resistance

    }

  };

}

