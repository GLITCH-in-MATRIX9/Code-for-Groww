import express from "express";
import cors from "cors";

import { analyzePulse } from "./services/pulseAnalyzer.js";

import {
  getDashboardStocks,
  DashboardStock,
} from "./services/dashboardService.js";

import { getMarketSnapshot } from "./services/marketSnapshotService.js";

import { getStockDashboard } from "./services/stockDashboardService.js";

import { getWatchlistPerformance } from "./services/dashboardPerformanceService.js";

import {
  addToWatchlist,
  getWatchlist,
  getWatchlistItem,
  removeFromWatchlist,
  updateLastChecked,
} from "./services/watchlistService.js";

import { saveSnapshot } from "./services/snapshotService.js";

import { getChangesSinceLastChecked } from "./services/snapshotComparisonService.js";

import { searchStocksService } from "./services/stockSearchService.js";

import { isYahooUnavailableError } from "./marketData/yahooFinance.js";

const app = express();

const PORT = Number(process.env.PORT) || 3001;

// --------------------------------
// MIDDLEWARE
// --------------------------------

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://code-for-groww.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

// --------------------------------
// ERROR HELPERS
// --------------------------------

function sendMarketDataError(
  res: express.Response,
  error: unknown,
  fallbackMessage: string,
  symbol?: string
) {
  console.error(fallbackMessage, error);

  if (isYahooUnavailableError(error)) {
    return res.status(503).json({
      error:
        "Market data provider is temporarily rate-limited. Please try again in a few minutes.",
      code: "MARKET_DATA_RATE_LIMITED",
      ...(symbol ? { symbol } : {}),
    });
  }

  return res.status(500).json({
    error: fallbackMessage,
    code: "INTERNAL_SERVER_ERROR",
    ...(symbol ? { symbol } : {}),
  });
}

// --------------------------------
// DASHBOARD BRIEFING HELPER
// --------------------------------

function generateDashboardBriefing(
  stocks: DashboardStock[]
): string {
  const analyzedStocks = stocks.filter(
    (stock) => stock.latestSnapshot
  );

  if (analyzedStocks.length === 0) {
    return (
      "No market insights are available yet. " +
      "Analyze stocks in your watchlist to generate your first Pulse briefing."
    );
  }

  const sortedStocks = [...analyzedStocks].sort(
    (a, b) =>
      (b.latestSnapshot?.meaningfulnessScore ?? 0) -
      (a.latestSnapshot?.meaningfulnessScore ?? 0)
  );

  const importantStocks = sortedStocks.slice(0, 3);

  const criticalCount = analyzedStocks.filter(
    (stock) =>
      stock.latestSnapshot?.severity === "critical"
  ).length;

  const highCount = analyzedStocks.filter(
    (stock) =>
      stock.latestSnapshot?.severity === "high"
  ).length;

  const stockNames = importantStocks
    .map(
      (stock) =>
        stock.companyName || stock.symbol
    )
    .join(", ");

  const topReasons = importantStocks
    .flatMap(
      (stock) =>
        stock.latestSnapshot?.reasons ?? []
    )
    .filter(Boolean)
    .slice(0, 2);

  if (criticalCount === 0 && highCount === 0) {
    return (
      `Your watchlist is relatively stable. ` +
      `${stockNames} currently represent the most notable changes, ` +
      `but no critical market activity was detected.`
    );
  }

  let priorityText = "";

  if (criticalCount > 0) {
    priorityText =
      `${criticalCount} critical change${
        criticalCount > 1 ? "s" : ""
      } require your attention.`;
  } else if (highCount > 0) {
    priorityText =
      `${highCount} high-priority change${
        highCount > 1 ? "s" : ""
      } were detected.`;
  }

  let reasonText = "";

  if (topReasons.length > 0) {
    reasonText =
      ` Key signals include ${topReasons.join(" and ")}.`;
  }

  return (
    `${priorityText} ` +
    `${stockNames} generated the most meaningful activity ` +
    `across your watchlist.` +
    reasonText
  );
}

// --------------------------------
// HEALTH CHECK
// --------------------------------

app.get("/api/health", (_req, res) => {
  return res.json({
    status: "ok",
    service: "pulse-ai",
  });
});

// --------------------------------
// STOCK ANALYSIS
// --------------------------------

app.get(
  "/api/stocks/:symbol/analysis",
  async (req, res) => {
    const symbol = req.params.symbol?.toUpperCase();

    if (!symbol) {
      return res.status(400).json({
        error: "Stock symbol is required.",
      });
    }

    try {
      const result = await analyzePulse(symbol);

      console.log(`Saving snapshot for ${symbol}...`);

      const snapshot = await saveSnapshot(result);

      console.log(
        "Snapshot saved successfully:",
        snapshot
      );

      return res.json(result);
    } catch (error) {
      return sendMarketDataError(
        res,
        error,
        "Unable to analyze stock.",
        symbol
      );
    }
  }
);

// --------------------------------
// GET WATCHLIST
// --------------------------------

app.get(
  "/api/watchlist",
  async (_req, res) => {
    try {
      const watchlist = await getWatchlist();

      return res.json(watchlist);
    } catch (error) {
      console.error("Failed to get watchlist:", error);

      return res.status(500).json({
        error: "Unable to fetch watchlist.",
      });
    }
  }
);

// --------------------------------
// ADD TO WATCHLIST
// --------------------------------

app.post(
  "/api/watchlist",
  async (req, res) => {
    const { symbol, companyName } = req.body;

    if (
      typeof symbol !== "string" ||
      typeof companyName !== "string"
    ) {
      return res.status(400).json({
        error: "symbol and companyName are required.",
      });
    }

    try {
      const item = await addToWatchlist(
        symbol,
        companyName
      );

      return res.status(201).json(item);
    } catch (error) {
      console.error("Failed to add stock:", error);

      return res.status(500).json({
        error: "Unable to add stock to watchlist.",
      });
    }
  }
);

// --------------------------------
// REMOVE FROM WATCHLIST
// --------------------------------

app.delete(
  "/api/watchlist/:symbol",
  async (req, res) => {
    const symbol = req.params.symbol;

    if (!symbol) {
      return res.status(400).json({
        error: "Stock symbol is required.",
      });
    }

    try {
      const removed = await removeFromWatchlist(symbol);

      if (!removed) {
        return res.status(404).json({
          error: "Stock not found in watchlist.",
        });
      }

      return res.json({
        success: true,
        symbol: symbol.toUpperCase(),
      });
    } catch (error) {
      console.error("Failed to remove stock:", error);

      return res.status(500).json({
        error: "Unable to remove stock.",
      });
    }
  }
);

// --------------------------------
// SINCE LAST CHECKED
// --------------------------------

app.get(
  "/api/stocks/:symbol/since-last-checked",
  async (req, res) => {
    const symbol = req.params.symbol?.toUpperCase();

    if (!symbol) {
      return res.status(400).json({
        error: "Stock symbol is required.",
      });
    }

    try {
      // 1. Check watchlist item
      const watchlistItem = await getWatchlistItem(symbol);

      if (!watchlistItem) {
        return res.status(404).json({
          error: `${symbol} is not in the watchlist.`,
          symbol,
        });
      }

      // 2. Run fresh Pulse analysis
      console.log(
        `Running fresh Pulse analysis for ${symbol}...`
      );

      const result = await analyzePulse(symbol);

      // 3. Save latest snapshot
      console.log(
        `Saving latest snapshot for ${symbol}...`
      );

      await saveSnapshot(result);

      // 4. Compare against last checked timestamp
      console.log(
        `Calculating changes since last check for ${symbol}...`
      );

      const comparison =
        await getChangesSinceLastChecked(symbol);

      // 5. Update last_checked_at after comparison
      await updateLastChecked(symbol);

      // 6. Return result
      return res.json({
        symbol,
        lastCheckedAt: watchlistItem.lastCheckedAt,
        currentCheckedAt: new Date(),
        previousSnapshot: comparison.previousSnapshot,
        currentSnapshot: comparison.currentSnapshot,
        changes: comparison.changes,
      });
    } catch (error) {
      return sendMarketDataError(
        res,
        error,
        "Unable to calculate changes since last checked.",
        symbol
      );
    }
  }
);

// --------------------------------
// DASHBOARD
// --------------------------------

app.get(
  "/api/dashboard",
  async (_req, res) => {
    try {
      const stocks = await getDashboardStocks();

      let critical = 0;
      let high = 0;
      let notable = 0;
      let stable = 0;

      for (const stock of stocks) {
        const snapshot = stock.latestSnapshot;

        if (!snapshot) {
          continue;
        }

        switch (snapshot.severity) {
          case "critical":
            critical++;
            break;

          case "high":
            high++;
            break;

          case "medium":
            notable++;
            break;

          case "low":
            stable++;
            break;
        }
      }

      const aiBriefing =
        generateDashboardBriefing(stocks);

      return res.json({
        attentionSummary: {
          critical,
          high,
          notable,
          stable,
        },
        aiBriefing,
        stocks,
      });
    } catch (error) {
      console.error("Failed to load dashboard:", error);

      return res.status(500).json({
        error: "Unable to load dashboard.",
      });
    }
  }
);

// --------------------------------
// DASHBOARD PERFORMANCE
// --------------------------------

app.get(
  "/api/dashboard/performance",
  async (req, res) => {
    try {
      const requestedRange =
        typeof req.query.range === "string"
          ? req.query.range
          : "today";

      const range =
        requestedRange === "week"
          ? "week"
          : requestedRange === "month"
            ? "month"
            : "today";

      const performance =
        await getWatchlistPerformance(range);

      return res.json(performance);
    } catch (error) {
      console.error(
        "Failed to load watchlist performance:",
        error
      );

      return res.status(500).json({
        error:
          "Unable to load watchlist performance.",
      });
    }
  }
);

// --------------------------------
// STOCK SEARCH
// Keep this route before /:symbol
// --------------------------------

app.get(
  "/api/stocks/search",
  async (req, res) => {
    const query =
      typeof req.query.q === "string"
        ? req.query.q
        : "";

    if (!query.trim()) {
      return res.json([]);
    }

    try {
      const stocks = await searchStocksService(query);

      return res.json(stocks);
    } catch (error) {
      console.error("Stock search failed:", error);

      return res.status(500).json({
        error: "Unable to search stocks.",
      });
    }
  }
);

// --------------------------------
// STOCK DASHBOARD DETAILS
// --------------------------------

app.get(
  "/api/stocks/:symbol",
  async (req, res) => {
    const symbol = req.params.symbol
      ?.toUpperCase()
      .trim();

    if (!symbol) {
      return res.status(400).json({
        error: "Stock symbol is required.",
      });
    }

    try {
      const stock = await getStockDashboard(symbol);

      return res.json(stock);
    } catch (error) {
      return sendMarketDataError(
        res,
        error,
        "Unable to fetch stock dashboard data.",
        symbol
      );
    }
  }
);

// --------------------------------
// MARKET SNAPSHOT
// --------------------------------

app.get(
  "/api/market/snapshot",
  async (_req, res) => {
    try {
      const indices = await getMarketSnapshot();

      return res.json({
        indices,
      });
    } catch (error) {
      return sendMarketDataError(
        res,
        error,
        "Unable to fetch market snapshot."
      );
    }
  }
);

// --------------------------------
// START SERVER
// This must be at the very bottom
// --------------------------------

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Pulse API running on port ${PORT}`
  );
});