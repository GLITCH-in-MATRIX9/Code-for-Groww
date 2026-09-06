import {
  searchStocks,
  type StockSearchResult
} from "../marketData/yahooFinance.js";


export async function searchStocksService(
  query: string
): Promise<StockSearchResult[]> {

  return searchStocks(query);

}