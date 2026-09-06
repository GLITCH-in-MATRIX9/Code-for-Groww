import {
  getStockQuote
} from "../marketData/yahooFinance.js";


export interface MarketIndex {

  name: string;

  symbol: string;

  price: number;

  changePercent: number;

}


/* ========================================
   MARKET INDICES
======================================== */

const MARKET_INDICES = [

  {
    name: "S&P 500",
    symbol: "^GSPC"
  },

  {
    name: "NASDAQ",
    symbol: "^IXIC"
  },

  {
    name: "DOW",
    symbol: "^DJI"
  }

];


/* ========================================
   GET MARKET SNAPSHOT
======================================== */

export async function getMarketSnapshot():
  Promise<MarketIndex[]> {

  const results =
    await Promise.allSettled(

      MARKET_INDICES.map(
        async (index) => {

          const quote =
            await getStockQuote(
              index.symbol
            );


          return {

            name:
              index.name,

            symbol:
              index.symbol,

            price:
              quote.price,

            changePercent:
              quote.priceChange

          };

        }
      )

    );


  /*
   * ----------------------------------------
   * ONLY RETURN SUCCESSFUL RESULTS
   * ----------------------------------------
   */

  return results
    .filter(
      (
        result
      ): result is PromiseFulfilledResult<MarketIndex> =>
        result.status === "fulfilled"
    )
    .map(
      (result) =>
        result.value
    );

}