import type { GenerateResult, StockDetail, WatchlistItem } from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  getWatchlist: () => request<WatchlistItem[]>("/api/watchlist"),
  addStock: (symbol: string) => request("/api/watchlist", { method: "POST", body: JSON.stringify({ symbol }) }),
  removeStock: (symbol: string) => request(`/api/watchlist/${symbol}`, { method: "DELETE" }),
  searchStocks: (q: string) => request<Array<{ symbol: string; companyName: string }>>(`/api/stocks/search?q=${encodeURIComponent(q)}`),
  generateInsights: () => request<GenerateResult>("/api/insights/generate", { method: "POST" }),
  sinceLastChecked: () => request<{ lastCheckedAt: string | null; insights: GenerateResult["insights"] }>("/api/since-last-checked"),
  dismissInsight: (id: string) => request(`/api/insights/${id}/dismiss`, { method: "POST" }),
  getStockDetail: (symbol: string, timeframe: string) => request<StockDetail>(`/api/stocks/${symbol}?timeframe=${timeframe}`),
  getSettings: () => request<{ useLiveData: boolean; providers: { yahooFinance: boolean; finnhub: boolean; ollama: string } }>("/api/settings")
};
