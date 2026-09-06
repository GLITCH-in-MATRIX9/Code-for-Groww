import { useEffect, useState } from "react";

import AttentionSummary from "./AttentionSummary";
import DashboardLoadingState from "./DashboardLoadingState";
import MarketNews from "./MarketNews";
import MarketSnapshot from "./MarketSnapshot";
import PulseAIBriefing from "./PulseAIBriefing";
import StockDetails from "./StockDetails";
import StockPulse from "./StockPulse";
import TopMovers from "./TopMovers";
import WatchlistPerformanceChart from "./WatchlistPerformanceChart";


/* ========================================
   TYPES
======================================== */

interface WatchlistItem {
  id: number;
  symbol: string;
  companyName: string;
  createdAt: string;
}


interface MeaningfulnessSignals {
  priceMovement: number;
  volumeAnomaly: number;
  volatility: number;
  relativePerformance: number;
  eventImpact: number;
  newsImpact: number;
  userRelevance: number;
}


interface LatestSnapshot {
  price: number;
  priceChange: number;
  volumeRatio: number;
  volatilityChange: number;
  meaningfulnessScore: number;
  severity: string;
  reasons: string[];
  signals: MeaningfulnessSignals | null;
  newsHeadline: string | null;
  newsSource?: string | null;
  newsUrl?: string | null;
  createdAt: string;
}


interface DashboardStock {
  symbol: string;
  companyName: string;
  lastCheckedAt: string | null;
  latestSnapshot: LatestSnapshot | null;
}


interface AttentionSummaryData {
  critical: number;
  high: number;
  notable: number;
  stable: number;
}


interface DashboardResponse {
  attentionSummary: AttentionSummaryData;
  aiBriefing?: string;
  stocks: DashboardStock[];
}


interface StockSnapshot {
  symbol: string;
  companyName: string;
  price: number;
  priceChange: number;
  meaningfulnessScore: number;
  severity: string;
  currency?: string;
  newsHeadline: string | null;
  newsSource?: string | null;
  newsUrl?: string | null;
  createdAt: string;
}


interface NewsArticle {
  id: string;
  symbol: string;
  headline: string;
  source: string;
  publishedAgo: string;
  relatedTag: string;
  relatedTagLevel: "critical" | "high" | "notable";
  url?: string;
}


interface PulseOverviewProps {
  selectedSymbol: string | null;
  watchlist: WatchlistItem[];
  watchlistCount: number;
}


/* ========================================
   SEVERITY MAPPING
======================================== */

function bucketSeverity(severity: string) {
  const normalized = severity.toLowerCase();

  if (normalized === "critical") {
    return "critical";
  }

  if (normalized === "high") {
    return "high";
  }

  if (
    normalized === "medium" ||
    normalized === "notable"
  ) {
    return "notable";
  }

  return "stable";
}


/* ========================================
   NEWS TAG LEVEL
======================================== */

function getNewsTagLevel(
  severity: string
): "critical" | "high" | "notable" {
  const normalized = severity.toLowerCase();

  if (normalized === "critical") {
    return "critical";
  }

  if (normalized === "high") {
    return "high";
  }

  return "notable";
}


/* ========================================
   TIME AGO
======================================== */

function formatPublishedAgo(
  dateString: string
): string {
  const date = new Date(dateString);

  const difference =
    Date.now() - date.getTime();

  const minutes =
    Math.floor(difference / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours =
    Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days =
    Math.floor(hours / 24);

  return `${days} day${days === 1 ? "" : "s"} ago`;
}


/* ========================================
   COMPONENT
======================================== */

function PulseOverview({
  selectedSymbol,
  watchlist,
  watchlistCount,
}: PulseOverviewProps) {


  /* ========================================
     STATE
  ======================================== */

  const [snapshots, setSnapshots] =
    useState<StockSnapshot[]>([]);


  const [attentionCounts, setAttentionCounts] =
    useState<AttentionSummaryData>({
      critical: 0,
      high: 0,
      notable: 0,
      stable: 0,
    });


  const [aiBriefing, setAiBriefing] =
    useState<string>("");


  const [newsArticles, setNewsArticles] =
    useState<NewsArticle[]>([]);


  const [loadingSnapshots, setLoadingSnapshots] =
    useState(false);


  const [snapshotError, setSnapshotError] =
    useState<string | null>(null);


  /* ========================================
     FETCH DASHBOARD DATA
  ======================================== */

  useEffect(() => {

    async function loadDashboardData() {

      if (watchlist.length === 0) {

        setSnapshots([]);

        setNewsArticles([]);

        setAttentionCounts({
          critical: 0,
          high: 0,
          notable: 0,
          stable: 0,
        });

        setAiBriefing("");

        return;
      }


      try {

        setLoadingSnapshots(true);

        setSnapshotError(null);


        const response =
          await fetch(
            "http://localhost:3001/api/dashboard"
          );


        if (!response.ok) {

          throw new Error(
            "Unable to load dashboard data."
          );

        }


        const data: DashboardResponse =
          await response.json();


        /* ========================================
           ATTENTION SUMMARY
        ======================================== */

        setAttentionCounts({
          critical:
            data.attentionSummary?.critical ?? 0,

          high:
            data.attentionSummary?.high ?? 0,

          notable:
            data.attentionSummary?.notable ?? 0,

          stable:
            data.attentionSummary?.stable ?? 0,
        });


        /* ========================================
           AI BRIEFING
        ======================================== */

        setAiBriefing(
          data.aiBriefing ?? ""
        );


        /* ========================================
           STOCK SNAPSHOTS
        ======================================== */

        const loadedSnapshots =
          data.stocks
            .filter(
              (stock) =>
                stock.latestSnapshot !== null
            )
            .map(
              (stock) => {

                const snapshot =
                  stock.latestSnapshot!;


                return {

                  symbol:
                    stock.symbol,

                  companyName:
                    stock.companyName,

                  price:
                    Number(snapshot.price),

                  priceChange:
                    Number(snapshot.priceChange),

                  meaningfulnessScore:
                    Number(
                      snapshot.meaningfulnessScore
                    ),

                  severity:
                    snapshot.severity,

                  newsHeadline:
                    snapshot.newsHeadline,

                  newsSource:
                    snapshot.newsSource ?? null,

                  newsUrl:
                    snapshot.newsUrl ?? undefined,

                  createdAt:
                    snapshot.createdAt,

                } as StockSnapshot;

              }
            );


        setSnapshots(
          loadedSnapshots
        );


        /* ========================================
           MARKET NEWS

           Only create articles from REAL news
           returned by the backend.

           No fallback or hardcoded articles.
        ======================================== */

        const loadedNews =
          data.stocks
            .filter(
              (stock) =>
                stock.latestSnapshot?.newsHeadline
            )
            .map(
              (stock): NewsArticle => {

                const snapshot =
                  stock.latestSnapshot!;


                const severity =
                  snapshot.severity;


                const score =
                  Number(
                    snapshot.meaningfulnessScore
                  );


                return {

                  id:
                    `${stock.symbol}-${snapshot.createdAt}`,

                  symbol:
                    stock.symbol,

                  headline:
                    snapshot.newsHeadline!,

                  source:
                    snapshot.newsSource ??
                    "Market News",

                  publishedAgo:
                    formatPublishedAgo(
                      snapshot.createdAt
                    ),

                  relatedTag:
                    `${score}/100 Meaningfulness`,

                  relatedTagLevel:
                    getNewsTagLevel(
                      severity
                    ),

                  url:
                    snapshot.newsUrl ??
                    undefined,

                };

              }
            )
            .sort(
              (a, b) => {

                const stockA =
                  data.stocks.find(
                    (stock) =>
                      stock.symbol === a.symbol
                  );

                const stockB =
                  data.stocks.find(
                    (stock) =>
                      stock.symbol === b.symbol
                  );


                const scoreA =
                  stockA?.latestSnapshot
                    ?.meaningfulnessScore ?? 0;

                const scoreB =
                  stockB?.latestSnapshot
                    ?.meaningfulnessScore ?? 0;


                return scoreB - scoreA;

              }
            );


        setNewsArticles(
          loadedNews
        );

      }

      catch (error) {

        console.error(
          "Dashboard aggregation error:",
          error
        );


        setSnapshotError(
          "Unable to load pulse data for your watchlist."
        );

      }

      finally {

        setLoadingSnapshots(false);

      }

    }


    loadDashboardData();

  }, [watchlist]);


  /* ========================================
     PERFORMANCE COUNTS
  ======================================== */

  const gainers =
    snapshots.filter(
      (stock) =>
        stock.priceChange > 0
    ).length;


  const losers =
    snapshots.filter(
      (stock) =>
        stock.priceChange < 0
    ).length;


  const unchanged =
    snapshots.filter(
      (stock) =>
        stock.priceChange === 0
    ).length;


  /* ========================================
     TOP GAINER
  ======================================== */

  const biggestGainer =
    snapshots
      .filter(
        (stock) =>
          stock.priceChange > 0
      )
      .sort(
        (a, b) =>
          b.priceChange -
          a.priceChange
      )[0] ?? null;


  /* ========================================
     TOP LOSER
  ======================================== */

  const biggestLoser =
    snapshots
      .filter(
        (stock) =>
          stock.priceChange < 0
      )
      .sort(
        (a, b) =>
          a.priceChange -
          b.priceChange
      )[0] ?? null;


  /* ========================================
     MOST MEANINGFUL
  ======================================== */

  const mostMeaningful =
    [...snapshots]
      .sort(
        (a, b) =>
          b.meaningfulnessScore -
          a.meaningfulnessScore
      )[0] ?? null;


  /* ========================================
     RENDER
  ======================================== */

  return (

    <section className="mx-auto max-w-7xl">


      {/* ========================================
          PAGE INTRO
      ======================================== */}

      <div className="mb-10">

        <div
          className="
            flex
            flex-col
            justify-between
            gap-6
            md:flex-row
            md:items-end
          "
        >

          <div>

            <p
              className="
                text-[10px]
                font-light
                uppercase
                tracking-[0.25em]
                text-blue-300/50
              "
            >
              Your Market Pulse
            </p>


            <h1
              className="
                mt-4
                text-4xl
                font-light
                tracking-[-0.035em]
                text-white
                md:text-5xl
              "
            >
              What changed.

              <br />

              <span className="text-blue-300/80">
                Refresh Page after Adding new Stocks
              </span>

            </h1>

          </div>


          <div
            className="
              rounded-xl
              border
              border-white/[0.07]
              bg-white/[0.03]
              px-5
              py-4
            "
          >

            <p className="text-xs text-white/30">
              Stocks tracked
            </p>


            <p
              className="
                mt-1
                text-2xl
                font-light
                text-white/80
              "
            >
              {watchlistCount}
            </p>

          </div>

        </div>


        <p
          className="
            mt-6
            max-w-xl
            text-sm
            font-light
            leading-relaxed
            text-white/40
            md:text-base
          "
        >
          Pulse turns market movement, unusual activity
          and company signals into meaningful context.
        </p>

      </div>


      {/* ========================================
          WATCHLIST DATA
      ======================================== */}

      {watchlistCount > 0 && (

        <div className="mb-10 space-y-6">


          {loadingSnapshots && (
            <DashboardLoadingState />
          )}


          {snapshotError && (

            <div
              className="
                rounded-2xl
                border
                border-red-400/20
                bg-red-400/[0.05]
                p-6
              "
            >

              <p className="text-sm font-light text-red-200">
                {snapshotError}
              </p>

            </div>

          )}


          {!loadingSnapshots &&
            !snapshotError &&
            snapshots.length > 0 && (

              <>


                {/* ATTENTION SUMMARY */}

                <AttentionSummary
                  critical={attentionCounts.critical}
                  high={attentionCounts.high}
                  notable={attentionCounts.notable}
                  stable={attentionCounts.stable}
                />


                {/* AI BRIEFING */}

                <PulseAIBriefing
                  briefing={aiBriefing}
                />


                {/* BIGGEST MOVERS */}

                <TopMovers
                  biggestGainer={
                    biggestGainer
                      ? {
                          symbol:
                            biggestGainer.symbol,

                          changePercent:
                            biggestGainer.priceChange,
                        }
                      : null
                  }

                  biggestLoser={
                    biggestLoser
                      ? {
                          symbol:
                            biggestLoser.symbol,

                          changePercent:
                            biggestLoser.priceChange,
                        }
                      : null
                  }

                  mostMeaningful={
                    mostMeaningful
                      ? {
                          symbol:
                            mostMeaningful.symbol,

                          score:
                            mostMeaningful.meaningfulnessScore,
                        }
                      : null
                  }
                />


                {/* PERFORMANCE + MARKET */}

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-6
                    lg:grid-cols-[1fr_1fr]
                  "
                >

                  <WatchlistPerformanceChart
                    totalStocks={snapshots.length}
                    gainers={gainers}
                    losers={losers}
                    unchanged={unchanged}
                  />


                  <MarketSnapshot />

                </div>


                {/* REAL MARKET NEWS */}

                <MarketNews
                  articles={newsArticles}
                />


              </>

            )}

        </div>

      )}


      {/* ========================================
          NO STOCK SELECTED
      ======================================== */}

      {!selectedSymbol && (

        <div
          className="
            rounded-2xl
            border
            border-white/[0.06]
            bg-white/[0.02]
            p-10
          "
        >

          <p
            className="
              text-lg
              font-light
              text-white/70
            "
          >
            Select a stock to begin.
          </p>


          <p
            className="
              mt-3
              max-w-md
              text-sm
              font-light
              leading-relaxed
              text-white/35
            "
          >
            Choose a stock from your watchlist and Pulse
            will immediately show its market snapshot
            while deeper analysis is prepared.
          </p>

        </div>

      )}


      {/* ========================================
          STOCK EXPERIENCE
      ======================================== */}

      {selectedSymbol && (

        <div className="space-y-6">

          <StockDetails
            symbol={selectedSymbol}
          />


          <StockPulse
            symbol={selectedSymbol}
          />

        </div>

      )}

    </section>

  );

}


export default PulseOverview;