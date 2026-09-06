import { useEffect, useState } from "react";

import AIUnavailableState from "./AIUnavailableState";
import MeaningfulnessBreakdownContainer from "./MeaningfulnessBreakdownContainer";

interface Snapshot {
  id: number;
  symbol: string;
  price: number;
  priceChange: number;
  volume: number;
  averageVolume: number;
  volumeRatio: number;
  volatilityChange: number;
  meaningfulnessScore: number;
  severity: string;
  reasons: string[];
  newsHeadline: string | null;
  createdAt: string;
  currency: string;
  /*
    NEW — optional, backend not yet returning these.
    scoreBreakdown: the per-signal weighting behind meaningfulnessScore
    (Price Movement, Volume Anomaly, Volatility, Relative Performance,
    Event Impact, News Impact, User Relevance). Until the API sends this,
    we fall back to a rough estimate built from fields we already have.
  */
  scoreBreakdown?: { label: string; value: number }[];
  /*
    NEW — optional. When the LLM (Ollama) explanation pipeline fails,
    the backend should set this to false and still return the
    deterministic reasons/guidance, which we already have via
    getSeverityGuidance. When true or omitted, we show the guidance
    text as normal.
  */
  aiExplanationAvailable?: boolean;
}

interface Change {
  type: string;
  message: string;
  importance: string;
}

interface ChangeResponse {
  symbol: string;
  lastCheckedAt: string | null;
  currentCheckedAt: string;
  previousSnapshot: Snapshot | null;
  currentSnapshot: Snapshot;
  changes: Change[];
}

interface StockPulseProps {
  symbol: string;
}

function formatPrice(value: number, currency?: string) {
  const safeCurrency = currency?.trim().toUpperCase() || "USD";

  const localeMap: Record<string, string> = {
    INR: "en-IN",
    USD: "en-US",
    GBP: "en-GB",
    EUR: "de-DE",
  };

  const locale = localeMap[safeCurrency] || "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: safeCurrency,
    maximumFractionDigits: 2,
  }).format(value);
}

/* ========================================
   PLAIN-LANGUAGE INTERPRETATION HELPERS
======================================== */

function getVolumeInterpretation(ratio: number) {
  if (ratio >= 2) {
    return "Trading activity is far above normal — a strong signal that something is drawing attention to this stock right now.";
  }
  if (ratio >= 1.2) {
    return "More people are trading this stock than usual, suggesting rising interest.";
  }
  if (ratio >= 0.8) {
    return "Trading activity is roughly in line with recent averages — nothing unusual here.";
  }
  return "Trading activity is quieter than usual, which can mean lower conviction behind the current price move.";
}

function getVolatilityInterpretation(change: number) {
  if (Math.abs(change) >= 10) {
    return "Price swings have picked up noticeably — expect bigger day-to-day movement than recently.";
  }
  if (Math.abs(change) >= 3) {
    return "Price swings are shifting somewhat compared to recent history.";
  }
  return "Price movement is steady and consistent with recent patterns.";
}

function getSeverityGuidance(severity: string) {
  switch (severity) {
    case "critical":
      return "This is one of the more significant changes Pulse has flagged — worth a closer look before you decide anything.";
    case "high":
      return "This is a meaningful shift. Consider checking recent news or your original reason for holding this stock.";
    case "medium":
      return "Worth noting, but on its own this isn't usually a reason to act.";
    default:
      return "This falls within normal day-to-day movement — no action typically needed.";
  }
}

/*
  Rough stand-in for a real backend-computed breakdown.
  Clamps each estimate to 0–100 so the bars never overflow.
  Swap this out once /since-last-checked returns scoreBreakdown directly.
*/
function StockPulse({ symbol }: StockPulseProps) {
  const [data, setData] = useState<ChangeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    async function loadStockPulse() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://localhost:3001/api/stocks/${symbol}/since-last-checked`,
        );

        if (!response.ok) {
          throw new Error("Unable to analyze stock.");
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Pulse analysis error:", error);
        setError("Unable to load Pulse intelligence.");
      } finally {
        setLoading(false);
      }
    }

    loadStockPulse();
    setShowBreakdown(false);
  }, [symbol]);

  /* ========================================
      LOADING — now shows WHAT it's doing
  ======================================== */

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[400px]
          flex-col
          items-center
          justify-center
          gap-6
          rounded-2xl
          border
          border-white/[0.06]
          bg-white/[0.02]
          px-6
          text-center
        "
      >
        <div
          className="
            h-10
            w-10
            animate-spin
            rounded-full
            border-2
            border-blue-400/20
            border-t-blue-400
          "
        />

        <div>
          <p className="text-sm font-light text-white/60">
            Pulse is analyzing {symbol}...
          </p>

          <p className="mt-2 max-w-sm text-xs font-light text-white/30">
            Checking price momentum, trading volume, volatility and recent
            news to see if anything meaningful has changed.
          </p>
        </div>
      </div>
    );
  }

  /* ========================================
      ERROR
  ======================================== */

  if (error) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-red-400/20
          bg-red-400/[0.05]
          p-6
        "
      >
        <p className="text-sm font-light text-red-200">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const stock = data.currentSnapshot;

  const scoreColor =
    stock.meaningfulnessScore >= 70
      ? "text-red-300"
      : stock.meaningfulnessScore >= 40
        ? "text-yellow-300"
        : "text-blue-300";

  const aiAvailable = stock.aiExplanationAvailable ?? true;

  return (
    <div className="space-y-6">
      {/* ========================================
          STOCK HEADER
      ======================================== */}

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
            Live Pulse Analysis
          </p>

          <h2
            className="
              mt-3
              text-4xl
              font-light
              tracking-[-0.035em]
              text-white
            "
          >
            {symbol}
          </h2>

          <p className="mt-2 text-sm font-light text-white/35">
            What changed since you last checked.
          </p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-sm text-white/30">Current Price</p>

          <p className="mt-1 text-3xl font-light text-white">
            {formatPrice(stock.price, stock.currency)}
          </p>

          <p
            className={`
              mt-1
              text-sm
              font-light
              ${stock.priceChange >= 0 ? "text-blue-300" : "text-red-300"}
            `}
          >
            {stock.priceChange >= 0 ? "+" : ""}
            {stock.priceChange.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* ========================================
          MEANINGFULNESS CARD — now explains the score
          AND lets the user expand the full breakdown
      ======================================== */}

      <div
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          border-blue-400/[0.12]
          bg-gradient-to-br
          from-blue-500/[0.10]
          via-[#07152F]
          to-[#050B18]
          p-7
          md:p-9
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-72
            w-72
            rounded-full
            bg-blue-500/10
            blur-[100px]
          "
        />

        <div
          className="
            relative
            grid
            gap-8
            md:grid-cols-[1fr_auto]
            md:items-center
          "
        >
          <div>
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.22em]
                text-white/30
              "
            >
              Meaningfulness Score
            </p>

            <div className="mt-4 flex items-end gap-3">
              <h3
                className={`
                  text-6xl
                  font-light
                  tracking-[-0.05em]
                  ${scoreColor}
                `}
              >
                {stock.meaningfulnessScore}
              </h3>
              <span className="mb-2 text-sm text-white/25">/ 100</span>
            </div>

            <p className="mt-4 max-w-lg text-sm font-light leading-relaxed text-white/45">
              Pulse combines price momentum, trading volume, volatility and
              news signals into a single score — the higher the number, the
              more this change stands out from normal day-to-day noise.
            </p>

            {/* AI GUIDANCE, WITH FALLBACK */}

            {aiAvailable ? (
              <div
                className="
                  mt-5
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-white/[0.03]
                  px-4
                  py-3
                "
              >
                <p className="text-xs font-light leading-relaxed text-white/60">
                  <span className="font-normal text-white/80">
                    What this means:{" "}
                  </span>
                  {getSeverityGuidance(stock.severity)}
                </p>
              </div>
            ) : (
              <div className="mt-5">
                <AIUnavailableState
                  deterministicExplanation={getSeverityGuidance(
                    stock.severity,
                  )}
                />
              </div>
            )}

            {/* SCORE BREAKDOWN TOGGLE */}

            <button
              onClick={() => setShowBreakdown((current) => !current)}
              className="
                mt-5
                text-xs
                font-light
                text-blue-300/70
                transition
                hover:text-blue-200
              "
            >
              {showBreakdown
                ? "Hide score breakdown ↑"
                : "View Score Breakdown →"}
            </button>

            {showBreakdown && (
              <div className="mt-5">
                <MeaningfulnessBreakdownContainer symbol={symbol} />
              </div>
            )}
          </div>

          <div
            className="
              rounded-xl
              border
              border-white/[0.08]
              bg-white/[0.04]
              px-6
              py-5
            "
          >
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.18em]
                text-white/30
              "
            >
              Severity
            </p>

            <p className="mt-3 text-xl font-light capitalize text-white/80">
              {stock.severity}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================
          REASONS — why the model flagged this
      ======================================== */}

      <div
        className="
          rounded-2xl
          border
          border-white/[0.06]
          bg-white/[0.02]
          p-7
        "
      >
        <p
          className="
            text-[10px]
            uppercase
            tracking-[0.22em]
            text-white/30
          "
        >
          Why Pulse noticed this
        </p>

        <p className="mt-2 text-xs font-light text-white/30">
          These are the specific signals Pulse detected in its analysis.
        </p>

        <div className="mt-6 space-y-3">
          {stock.reasons.length > 0 ? (
            stock.reasons.map((reason, index) => (
              <div
                key={index}
                className="
                  flex
                  items-start
                  gap-4
                  rounded-xl
                  border
                  border-white/[0.05]
                  bg-white/[0.02]
                  px-5
                  py-4
                "
              >
                <span
                  className="
                    mt-1.5
                    h-1.5
                    w-1.5
                    shrink-0
                    rounded-full
                    bg-blue-400
                    shadow-[0_0_10px_rgba(96,165,250,0.8)]
                  "
                />

                <p className="text-sm font-light leading-relaxed text-white/60">
                  {reason}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm font-light text-white/30">
              No specific standout signals this time — movement is within
              typical ranges.
            </p>
          )}
        </div>
      </div>

      {/* ========================================
          MARKET SIGNALS — now with plain-language readouts
      ======================================== */}

      <div className="grid gap-5 md:grid-cols-3">
        <div
          className="
            rounded-2xl
            border
            border-white/[0.06]
            bg-white/[0.02]
            p-6
          "
        >
          <p className="text-xs text-white/30">Volume</p>

          <p className="mt-4 text-2xl font-light text-white/80">
            {stock.volume.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-white/30">
            {stock.volumeRatio.toFixed(2)}× average
          </p>

          <p className="mt-4 text-xs font-light leading-relaxed text-white/45">
            {getVolumeInterpretation(stock.volumeRatio)}
          </p>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-white/[0.06]
            bg-white/[0.02]
            p-6
          "
        >
          <p className="text-xs text-white/30">Volatility</p>

          <p className="mt-4 text-2xl font-light text-white/80">
            {stock.volatilityChange.toFixed(1)}%
          </p>

          <p className="mt-2 text-xs text-white/30">Change detected</p>

          <p className="mt-4 text-xs font-light leading-relaxed text-white/45">
            {getVolatilityInterpretation(stock.volatilityChange)}
          </p>
        </div>

        {/* NEWS — now transparent when unavailable */}
        <div
          className="
            rounded-2xl
            border
            border-white/[0.06]
            bg-white/[0.02]
            p-6
          "
        >
          <p className="text-xs text-white/30">News Signal</p>

          {stock.newsHeadline ? (
            <p className="mt-4 text-sm font-light leading-relaxed text-white/65">
              {stock.newsHeadline}
            </p>
          ) : (
            <>
              <p className="mt-4 text-sm font-light leading-relaxed text-white/45">
                No recent news was found for this stock.
              </p>
              <p className="mt-3 text-xs font-light leading-relaxed text-white/25">
                This can happen for smaller or regionally listed companies
                where news coverage is limited. Pulse's other signals above
                are unaffected by this.
              </p>
            </>
          )}
        </div>
      </div>

      {/* ========================================
          CHANGES
      ======================================== */}

      <div
        className="
          rounded-2xl
          border
          border-white/[0.06]
          bg-white/[0.02]
          p-7
        "
      >
        <p
          className="
            text-[10px]
            uppercase
            tracking-[0.22em]
            text-white/30
          "
        >
          Since Last Checked
        </p>

        {data.changes.length === 0 ? (
          <p className="mt-5 text-sm font-light text-white/40">
            No significant changes detected yet. Pulse will keep watching and
            let you know if that changes.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {data.changes.map((change, index) => (
              <div
                key={index}
                className="
                  flex
                  items-start
                  justify-between
                  gap-5
                  rounded-xl
                  border
                  border-blue-400/[0.10]
                  bg-blue-400/[0.04]
                  px-5
                  py-4
                "
              >
                <div>
                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.18em]
                      text-blue-300/50
                    "
                  >
                    {change.type}
                  </p>

                  <p className="mt-2 text-sm font-light leading-relaxed text-blue-100/70">
                    {change.message}
                  </p>
                </div>

                <span
                  className="
                    shrink-0
                    rounded-full
                    border
                    border-blue-400/15
                    bg-blue-400/[0.08]
                    px-3
                    py-1
                    text-[10px]
                    font-light
                    uppercase
                    tracking-wide
                    text-blue-200/70
                  "
                >
                  {change.importance}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================
          NEXT STEPS — actionable takeaway
      ======================================== */}

      <div
        className="
          rounded-2xl
          border
          border-white/[0.06]
          bg-white/[0.015]
          p-7
        "
      >
        <p
          className="
            text-[10px]
            uppercase
            tracking-[0.22em]
            text-white/30
          "
        >
          What you might do
        </p>

        <ul className="mt-4 space-y-2 text-sm font-light leading-relaxed text-white/50">
          {stock.severity === "critical" || stock.severity === "high" ? (
            <>
              <li>• Check for company-specific news outside Pulse if none was found here.</li>
              <li>• Revisit why you're tracking this stock — does this change your view?</li>
              <li>• Consider whether the volume and volatility signals above line up with the price move.</li>
            </>
          ) : (
            <>
              <li>• No action typically needed — this is within normal movement.</li>
              <li>• Pulse will keep monitoring and flag anything more significant.</li>
            </>
          )}
        </ul>

        <p className="mt-4 text-[11px] font-light text-white/20">
          Pulse is informational only and does not constitute financial advice.
        </p>
      </div>
    </div>
  );
}

export default StockPulse;