import {
  useEffect,
  useState
} from "react";

import MeaningfulnessBreakdown from "./MeaningfulnessBreakdown";


/* ========================================
   BACKEND SHAPES

   Mirrors DashboardStock from the API
   (getDashboardStocks). s.signals is
   already the exact output of
   calculateMeaningfulness() in
   meaningfulnessEngine.ts — no
   re-derivation needed on the frontend.
======================================== */

interface SnapshotSignals {

  priceMovement: number;

  volumeAnomaly: number;

  volatility: number;

  relativePerformance: number;

  eventImpact: number;

  newsImpact: number;

  userRelevance: number;

}


interface LatestSnapshot {

  meaningfulnessScore: number;

  signals: SnapshotSignals | null;

}


interface DashboardStockApi {

  symbol: string;

  companyName: string;

  latestSnapshot: LatestSnapshot | null;

}


interface DashboardResponse {

  stocks: DashboardStockApi[];

}


interface MeaningfulnessBreakdownContainerProps {

  /*
   * Provide EITHER `symbol` (this component
   * fetches on its own) OR `stock` (already
   * fetched by a parent list — avoids one
   * network call per card in a dashboard).
   */

  symbol?: string;

  stock?: DashboardStockApi;

  apiBaseUrl?: string;

}


function MeaningfulnessBreakdownContainer({
  symbol,
  stock: providedStock,
  apiBaseUrl = "http://localhost:3001"
}: MeaningfulnessBreakdownContainerProps) {


  const [stock, setStock] =
    useState<DashboardStockApi | null>(
      providedStock ?? null
    );


  const [loading, setLoading] =
    useState(!providedStock);


  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {

    if (providedStock) {

      setStock(providedStock);

      setLoading(false);

      return;

    }


    if (!symbol) {

      setError(
        "No symbol or stock provided."
      );

      setLoading(false);

      return;

    }


    let cancelled = false;


    async function fetchStock() {

      try {

        setLoading(true);

        setError(null);


        const response =
          await fetch(
            `${apiBaseUrl}/api/dashboard`
          );


        if (!response.ok) {

          throw new Error(
            "Failed to fetch dashboard data."
          );

        }


        const data: DashboardResponse =
          await response.json();


        const match = data.stocks.find(
          (s) => s.symbol === symbol
        );


        if (!cancelled) {

          setStock(match ?? null);

        }

      }

      catch (err) {

        console.error(
          "Failed to load meaningfulness breakdown:",
          err
        );


        if (!cancelled) {

          setError(
            "Unable to load signal breakdown."
          );

        }

      }

      finally {

        if (!cancelled) {

          setLoading(false);

        }

      }

    }


    fetchStock();


    return () => {

      cancelled = true;

    };


  }, [symbol, providedStock, apiBaseUrl]);


  /* ---------- LOADING ---------- */

  if (loading) {

    return (

      <div
        className="
          rounded-2xl
          border
          border-white/[0.08]
          bg-white/[0.02]
          p-6
        "
      >

        <div className="animate-pulse space-y-4">

          <div className="h-3 w-40 rounded bg-white/[0.06]" />

          {[1, 2, 3, 4, 5, 6, 7].map((i) => (

            <div key={i} className="space-y-2">

              <div className="h-2 w-24 rounded bg-white/[0.05]" />

              <div className="h-1.5 w-full rounded-full bg-white/[0.04]" />

            </div>

          ))}

        </div>

      </div>

    );

  }


  /* ---------- ERROR ---------- */

  if (error) {

    return (

      <div
        className="
          flex
          h-56
          flex-col
          items-center
          justify-center
          gap-3
          rounded-2xl
          border
          border-white/[0.08]
          bg-white/[0.02]
        "
      >

        <p className="text-sm font-light text-white/40">

          {error}

        </p>

      </div>

    );

  }


  /* ---------- STOCK NOT FOUND ---------- */

  if (!stock) {

    return (

      <div
        className="
          flex
          h-56
          flex-col
          items-center
          justify-center
          gap-3
          rounded-2xl
          border
          border-white/[0.08]
          bg-white/[0.02]
        "
      >

        <p className="text-sm font-light text-white/40">

          Stock not found on the watchlist.

        </p>

      </div>

    );

  }


  /*
   * MeaningfulnessBreakdown handles the
   * "no snapshot yet" empty state itself
   * when signals is null — no need to
   * duplicate that branch here.
   */

  return (

    <MeaningfulnessBreakdown
      signals={stock.latestSnapshot?.signals ?? null}
      score={stock.latestSnapshot?.meaningfulnessScore ?? 0}
    />

  );

}


export default MeaningfulnessBreakdownContainer;
