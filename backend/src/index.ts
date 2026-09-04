import cors from "cors";
import express from "express";
import { config } from "./config";
import { Store } from "./db/store";
import { ProviderGateway } from "./providers";
import { generateInsights, getStockDetail } from "./services/pipeline";

const app = express();
const store = new Store();
const provider = new ProviderGateway();

app.use(cors({ origin: config.frontendOrigin }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mode: config.useLiveData ? "live+fallback" : "demo" });
});

app.get("/api/watchlist", async (_req, res) => {
  const watchlist = await store.getWatchlist();
  const quotes = await provider.getQuotes(watchlist.map((w) => w.symbol));
  const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));
  res.json(
    watchlist.map((stock) => ({
      ...stock,
      quote: quoteMap.get(stock.symbol) ?? null
    }))
  );
});

app.post("/api/watchlist", async (req, res) => {
  const symbol = String(req.body?.symbol ?? "").trim().toUpperCase();
  if (!symbol) return res.status(400).json({ error: "symbol_required" });
  const results = await provider.searchStocks(symbol);
  const match = results.find((r) => r.symbol === symbol) ?? results[0];
  if (!match) return res.status(404).json({ error: "symbol_not_found" });
  await store.addWatchlistStock(match);
  res.status(201).json(match);
});

app.delete("/api/watchlist/:symbol", async (req, res) => {
  await store.removeWatchlistStock(req.params.symbol.toUpperCase());
  res.status(204).send();
});

app.get("/api/stocks/search", async (req, res) => {
  const q = String(req.query.q ?? "");
  const results = await provider.searchStocks(q);
  res.json(results.slice(0, 8));
});

app.get("/api/since-last-checked", async (_req, res) => {
  const lastInsights = await store.getLatestInsights();
  const snapshot = await store.getLatestSnapshot();
  res.json({
    lastCheckedAt: snapshot?.createdAt ?? null,
    insights: lastInsights
  });
});

app.post("/api/insights/generate", async (_req, res) => {
  const result = await generateInsights(provider, store);
  res.json(result);
});

app.post("/api/insights/:id/dismiss", async (req, res) => {
  await store.dismissInsight(req.params.id);
  res.status(204).send();
});

app.get("/api/stocks/:symbol", async (req, res) => {
  const timeframe = String(req.query.timeframe ?? "1M") as "1D" | "1W" | "1M" | "3M" | "1Y";
  const detail = await getStockDetail(provider, store, req.params.symbol, timeframe);
  res.json(detail);
});

app.get("/api/settings", (_req, res) => {
  res.json({
    useLiveData: config.useLiveData,
    providers: {
      yahooFinance: true,
      finnhub: Boolean(config.finnhubApiKey),
      ollama: config.ollamaUrl
    }
  });
});

const clients = new Set<express.Response>();
app.get("/api/events/quotes", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.add(res);
  req.on("close", () => clients.delete(res));
});

setInterval(async () => {
  if (!clients.size) return;
  const watchlist = await store.getWatchlist();
  const quotes = await provider.getQuotes(watchlist.map((w) => w.symbol));
  const payload = `data: ${JSON.stringify({ quotes, at: new Date().toISOString() })}\n\n`;
  for (const client of clients) {
    client.write(payload);
  }
}, 12000);

async function start() {
  await store.init();
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Pulse backend listening on http://localhost:${config.port}`);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
