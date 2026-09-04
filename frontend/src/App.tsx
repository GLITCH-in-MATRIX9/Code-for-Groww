import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { api } from "./api";
import type { Insight, WatchlistItem } from "./types";

type View = "Home" | "Watchlist" | "Since You Last Checked" | "Stock Detail" | "Settings";

type Timeframe = "1D" | "1W" | "1M" | "3M" | "1Y";

const navItems: View[] = ["Home", "Watchlist", "Since You Last Checked", "Stock Detail", "Settings"];

const scoreClass: Record<Insight["severity"], string> = {
  critical: "text-pink-300",
  high: "text-cyan-300",
  medium: "text-blue-300",
  low: "text-slate-300"
};

export default function App() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("Home");
  const [selectedSymbol, setSelectedSymbol] = useState("NVDA");
  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
  const [searchText, setSearchText] = useState("");

  const watchlistQuery = useQuery({ queryKey: ["watchlist"], queryFn: api.getWatchlist, refetchInterval: 30000 });
  const sinceQuery = useQuery({ queryKey: ["since-last-checked"], queryFn: api.sinceLastChecked });
  const settingsQuery = useQuery({ queryKey: ["settings"], queryFn: api.getSettings });

  const detailQuery = useQuery({
    queryKey: ["stock-detail", selectedSymbol, timeframe],
    queryFn: () => api.getStockDetail(selectedSymbol, timeframe),
    enabled: Boolean(selectedSymbol)
  });

  const searchQuery = useQuery({
    queryKey: ["search", searchText],
    queryFn: () => api.searchStocks(searchText),
    enabled: searchText.trim().length > 0
  });

  const generateMutation = useMutation({
    mutationFn: api.generateInsights,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["since-last-checked"] });
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    }
  });

  const addMutation = useMutation({
    mutationFn: (symbol: string) => api.addStock(symbol),
    onSuccess: () => {
      setSearchText("");
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    }
  });

  const removeMutation = useMutation({
    mutationFn: (symbol: string) => api.removeStock(symbol),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watchlist"] })
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => api.dismissInsight(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["since-last-checked"] })
  });

  useEffect(() => {
    const events = new EventSource("/api/events/quotes");
    events.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { quotes: WatchlistItem["quote"][] };
      queryClient.setQueryData<WatchlistItem[]>(["watchlist"], (current) => {
        if (!current) return current;
        const bySymbol = new Map((payload.quotes ?? []).filter(Boolean).map((q: any) => [q.symbol, q]));
        return current.map((item) => ({ ...item, quote: bySymbol.get(item.symbol) ?? item.quote }));
      });
    };
    return () => events.close();
  }, [queryClient]);

  const topInsight = sinceQuery.data?.insights?.[0];
  const watchlist = watchlistQuery.data ?? [];

  const selectedRow = useMemo(() => watchlist.find((w) => w.symbol === selectedSymbol) ?? watchlist[0], [watchlist, selectedSymbol]);

  useEffect(() => {
    if (selectedRow?.symbol) setSelectedSymbol(selectedRow.symbol);
  }, [selectedRow?.symbol]);

  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto flex max-w-[1500px] gap-4 p-4 lg:p-6">
        <aside className="w-60 rounded-2xl border border-pulse-border/70 bg-pulse-card/60 p-4 shadow-glow backdrop-blur">
          <div className="mb-8">
            <div className="text-xl font-semibold tracking-wide">Pulse</div>
            <p className="text-xs text-slate-400">Smart market watchlist</p>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setView(item)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${view === item ? "bg-white/10 text-cyan-200" : "text-slate-300 hover:bg-white/5"}`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 space-y-4">
          <header className="flex flex-wrap items-center gap-3 rounded-2xl border border-pulse-border/70 bg-pulse-card/60 p-4 shadow-glow backdrop-blur">
            <div className="relative min-w-[220px] flex-1">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search stocks"
                className="w-full rounded-lg border border-pulse-border bg-[#0b1320] px-3 py-2 text-sm outline-none focus:border-cyan-400"
              />
              {searchText && searchQuery.data?.length ? (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-pulse-border bg-[#0c1524] p-1">
                  {searchQuery.data.map((result) => (
                    <button
                      type="button"
                      key={result.symbol}
                      onClick={() => addMutation.mutate(result.symbol)}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-white/10"
                    >
                      <span className="text-sm">{result.symbol}</span>
                      <span className="truncate pl-3 text-xs text-slate-400">{result.companyName}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => generateMutation.mutate()}
              className="rounded-lg border border-cyan-400/60 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-400/20"
            >
              {generateMutation.isPending ? "Generating…" : "Generate Insights"}
            </button>
            <div className="rounded-lg border border-pulse-border px-3 py-2 text-xs text-slate-300">@user</div>
          </header>

          {generateMutation.data?.steps?.length ? (
            <section className="rounded-2xl border border-pulse-border/70 bg-pulse-card/60 p-3 text-xs text-slate-300">
              <div className="mb-2 font-semibold text-slate-200">Insight generation progress</div>
              <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                {generateMutation.data.steps.map((step) => (
                  <div key={step.label} className="rounded-md bg-white/5 px-2 py-1">{step.done ? "✓" : "…"} {step.label}</div>
                ))}
              </div>
              <div className="mt-2 text-cyan-300">Insights updated</div>
            </section>
          ) : null}

          <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4">
              <article className="rounded-2xl border border-pulse-border/70 bg-pulse-card/60 p-4 shadow-glow backdrop-blur">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Since You Last Checked</h2>
                  <span className="text-xs text-slate-400">
                    {sinceQuery.data?.lastCheckedAt ? `Last checked ${new Date(sinceQuery.data.lastCheckedAt).toLocaleString()}` : "No prior snapshot yet"}
                  </span>
                </div>
                {topInsight ? (
                  <div className="rounded-xl border border-pulse-border bg-[#0b1320] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xl font-semibold">{topInsight.symbol}</div>
                        <div className="mt-1 text-sm text-slate-300">{topInsight.explanation}</div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
                          <div>Since check: {topInsight.metrics.sinceLastCheckedPercent.toFixed(2)}%</div>
                          <div>Volume: {topInsight.metrics.volumeRatio.toFixed(2)}x avg</div>
                          <div>Relative perf: {topInsight.metrics.relativePerformancePercent.toFixed(2)}%</div>
                          <div>Event: {topInsight.event?.summary ?? "None"}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${scoreClass[topInsight.severity]}`}>{topInsight.score}</div>
                        <div className="text-xs uppercase tracking-wide text-slate-400">{topInsight.severity}</div>
                        <button
                          type="button"
                          onClick={() => dismissMutation.mutate(topInsight.id)}
                          className="mt-3 rounded-md border border-pulse-border px-2 py-1 text-xs hover:bg-white/10"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-1 text-xs text-slate-400 sm:grid-cols-2">
                      <div>Price Movement: {topInsight.breakdown.priceMovement}</div>
                      <div>Volume Anomaly: {topInsight.breakdown.volumeAnomaly}</div>
                      <div>Volatility Expansion: {topInsight.breakdown.volatilityExpansion}</div>
                      <div>Relative Performance: {topInsight.breakdown.relativePerformance}</div>
                      <div>Event Importance: {topInsight.breakdown.eventImportance}</div>
                      <div>News Impact: {topInsight.breakdown.newsImpact}</div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-pulse-border p-6 text-sm text-slate-400">
                    Generate insights to surface meaningful watchlist changes.
                  </div>
                )}
              </article>

              <article className="rounded-2xl border border-pulse-border/70 bg-pulse-card/60 p-4 shadow-glow backdrop-blur">
                <h2 className="mb-3 text-lg font-semibold">Watchlist</h2>
                {watchlistQuery.isLoading ? (
                  <div className="text-sm text-slate-400">Loading watchlist…</div>
                ) : watchlist.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-pulse-border p-4 text-sm text-slate-400">No stocks yet. Search and add symbols.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs text-slate-400">
                        <tr>
                          <th className="pb-2">Symbol</th>
                          <th className="pb-2">Company</th>
                          <th className="pb-2">Price</th>
                          <th className="pb-2">Change</th>
                          <th className="pb-2">Volume</th>
                          <th className="pb-2">Updated</th>
                          <th className="pb-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {watchlist.map((item) => (
                          <tr key={item.symbol} className="cursor-pointer border-t border-white/5 hover:bg-white/5" onClick={() => { setSelectedSymbol(item.symbol); setView("Stock Detail"); }}>
                            <td className="py-2 font-medium">{item.symbol}</td>
                            <td className="py-2 text-slate-300">{item.companyName}</td>
                            <td className="py-2">{item.quote ? `$${item.quote.price.toFixed(2)}` : "--"}</td>
                            <td className={`py-2 ${(item.quote?.changePercent ?? 0) >= 0 ? "text-cyan-300" : "text-pink-300"}`}>
                              {item.quote ? `${item.quote.change.toFixed(2)} (${item.quote.changePercent.toFixed(2)}%)` : "--"}
                            </td>
                            <td className="py-2">{item.quote?.volume.toLocaleString() ?? "--"}</td>
                            <td className="py-2 text-xs text-slate-400">{item.quote ? new Date(item.quote.lastUpdated).toLocaleTimeString() : "--"}</td>
                            <td className="py-2 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeMutation.mutate(item.symbol);
                                }}
                                className="rounded-md border border-pulse-border px-2 py-1 text-xs hover:bg-white/10"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            </div>

            <aside className="rounded-2xl border border-pulse-border/70 bg-pulse-card/60 p-4 shadow-glow backdrop-blur">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{selectedSymbol} Detail</h2>
                <div className="flex gap-1 text-xs">
                  {(["1D", "1W", "1M", "3M", "1Y"] as Timeframe[]).map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      className={`rounded px-2 py-1 ${timeframe === tf ? "bg-cyan-400/20 text-cyan-200" : "text-slate-400 hover:bg-white/10"}`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              {detailQuery.isLoading ? (
                <div className="text-sm text-slate-400">Loading detail…</div>
              ) : detailQuery.error || !detailQuery.data?.quote ? (
                <div className="rounded-lg border border-dashed border-pulse-border p-4 text-sm text-slate-400">Select a stock to view detail.</div>
              ) : (
                <>
                  <div className="mb-3 rounded-lg border border-pulse-border bg-[#0b1320] p-3">
                    <div className="text-2xl font-semibold">${detailQuery.data.quote.price.toFixed(2)}</div>
                    <div className={`${detailQuery.data.quote.changePercent >= 0 ? "text-cyan-300" : "text-pink-300"}`}>
                      {detailQuery.data.quote.change.toFixed(2)} ({detailQuery.data.quote.changePercent.toFixed(2)}%)
                    </div>
                    <div className="mt-2 text-xs text-slate-400">Volume {detailQuery.data.quote.volume.toLocaleString()}</div>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={detailQuery.data.historical}>
                        <defs>
                          <linearGradient id="pulse-chart" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#54d7ff" stopOpacity={0.7} />
                            <stop offset="95%" stopColor="#54d7ff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#1f2b40" strokeDasharray="3 3" />
                        <XAxis dataKey="date" hide />
                        <Tooltip contentStyle={{ background: "#0b1320", border: "1px solid #233552" }} />
                        <Area type="monotone" dataKey="close" stroke="#54d7ff" fill="url(#pulse-chart)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3">
                    <h3 className="mb-2 text-sm font-semibold">Recent News</h3>
                    <div className="space-y-2 text-xs">
                      {detailQuery.data.news.slice(0, 3).map((news) => (
                        <div key={news.id} className="rounded-lg border border-white/5 bg-white/5 p-2">
                          <div className="font-medium">{news.headline}</div>
                          <div className="text-slate-400">{news.source} • {new Date(news.publishedAt).toLocaleTimeString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </aside>
          </section>

          <section className="rounded-2xl border border-pulse-border/70 bg-pulse-card/40 p-3 text-xs text-slate-400">
            Active view: {view} • Mode: {settingsQuery.data?.useLiveData ? "Live + demo fallback" : "Demo fallback"}
          </section>
        </main>
      </div>
    </div>
  );
}
