
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* ========================================
   TYPES
======================================== */

interface StockDetailsProps {
  symbol: string;
}

type Range = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y";

interface StockHistoryPoint {
  date: string;
  open?: number;
  high?: number;
  low?: number;
  close: number;
  volume: number;

  sma20?: number;
  sma50?: number;
}

interface TechnicalIndicators {
  sma20?: number;
  sma50?: number;
  sma200?: number;

  rsi?: number;

  support?: number;
  resistance?: number;
}

interface StockData {
  symbol: string;
  companyName: string;

  price: number;
  previousClose: number;

  /**
   * Expected as percentage.
   * Example: 2.45 means +2.45%
   */
  priceChange: number;

  volume: number;
  averageVolume: number;

  currency: string;

  history?: StockHistoryPoint[];

  indicators?: TechnicalIndicators;
}

/* ========================================
   COMPONENT
======================================== */

function StockDetails({ symbol }: StockDetailsProps) {
  const [stock, setStock] = useState<StockData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [selectedRange, setSelectedRange] =
    useState<Range>("1M");

  /* ========================================
     LOAD STOCK DATA
  ======================================== */

  useEffect(() => {
    async function loadStockDetails() {
      try {
        setLoading(true);

        setError(null);

        setStock(null);

        /**
         * You can change this endpoint to:
         *
         * /api/stocks/${symbol}/dashboard
         *
         * when your backend provides history
         * and technical indicators.
         */
        const response = await fetch(
          `http://localhost:3001/api/stocks/${symbol}`,
        );

        if (!response.ok) {
          throw new Error("Unable to load stock details.");
        }

        const data: StockData = await response.json();

        setStock(data);
      } catch (error) {
        console.error("Stock details error:", error);

        setError("Unable to load market data.");
      } finally {
        setLoading(false);
      }
    }

    loadStockDetails();
  }, [symbol]);

  /* ========================================
     FORMATTERS
  ======================================== */

  function formatPrice(
    value: number,
    currency?: string,
  ) {
    const safeCurrency =
      currency?.trim().toUpperCase() || "USD";

    const localeMap: Record<string, string> = {
      INR: "en-IN",
      USD: "en-US",
      GBP: "en-GB",
      EUR: "de-DE",
    };

    const locale =
      localeMap[safeCurrency] || "en-US";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatCompactNumber(value: number) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatNumber(value: number) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(value);
  }

  /* ========================================
     FILTER HISTORY
  ======================================== */

  const chartData = useMemo(() => {
    if (!stock?.history?.length) {
      return [];
    }

    const history = stock.history;

    const rangeMap: Record<Range, number> = {
      "1D": 1,
      "1W": 7,
      "1M": 30,
      "3M": 90,
      "6M": 180,
      "1Y": 365,
    };

    const limit = rangeMap[selectedRange];

    if (selectedRange === "1D") {
      return history;
    }

    return history.slice(-limit);
  }, [stock, selectedRange]);

  /* ========================================
     DERIVED VALUES
  ======================================== */

  const isPositive =
    stock ? stock.priceChange >= 0 : false;

  const volumeRatio =
    stock && stock.averageVolume > 0
      ? stock.volume / stock.averageVolume
      : 0;

  const volumeStatus =
    volumeRatio >= 2
      ? "Unusually High"
      : volumeRatio >= 1.2
        ? "Above Average"
        : volumeRatio >= 0.8
          ? "Normal Activity"
          : "Below Average";

  const volumePositive = volumeRatio >= 1.2;

  /* ========================================
     PULSE SCORE
  ======================================== */

  const pulseAnalysis = useMemo(() => {
    if (!stock) {
      return {
        score: 50,
        trend: "Neutral",
        momentum: 0,
        volume: 0,
        technical: 0,
        risk: 0,
      };
    }

    let momentum = 50;
    let volumeScore = 50;
    let technical = 50;
    let risk = 50;

    /*
     * PRICE MOMENTUM
     */

    if (stock.priceChange >= 5) {
      momentum = 95;
    } else if (stock.priceChange >= 3) {
      momentum = 80;
    } else if (stock.priceChange >= 1) {
      momentum = 65;
    } else if (stock.priceChange > -1) {
      momentum = 50;
    } else if (stock.priceChange > -3) {
      momentum = 35;
    } else {
      momentum = 20;
    }

    /*
     * VOLUME
     */

    if (volumeRatio >= 2) {
      volumeScore = 90;
    } else if (volumeRatio >= 1.5) {
      volumeScore = 75;
    } else if (volumeRatio >= 1.1) {
      volumeScore = 60;
    } else if (volumeRatio >= 0.8) {
      volumeScore = 50;
    } else {
      volumeScore = 35;
    }

    /*
     * TECHNICALS
     */

    const rsi = stock.indicators?.rsi;

    if (rsi !== undefined) {
      if (rsi >= 50 && rsi <= 70) {
        technical = 80;
      } else if (rsi > 70) {
        technical = 55;
      } else if (rsi >= 40) {
        technical = 60;
      } else {
        technical = 35;
      }
    }

    /*
     * RISK
     */

    risk =
      Math.abs(stock.priceChange) > 5
        ? 40
        : Math.abs(stock.priceChange) > 3
          ? 60
          : 80;

    const score = Math.round(
      momentum * 0.35 +
        volumeScore * 0.25 +
        technical * 0.25 +
        risk * 0.15,
    );

    const trend =
      score >= 75
        ? "Strong Bullish"
        : score >= 60
          ? "Bullish"
          : score >= 45
            ? "Neutral"
            : score >= 30
              ? "Bearish"
              : "Strong Bearish";

    return {
      score,
      trend,
      momentum,
      volume: volumeScore,
      technical,
      risk,
    };
  }, [stock, volumeRatio]);

  /* ========================================
     MARKET INSIGHTS
  ======================================== */

  const insights = useMemo(() => {
    if (!stock) return [];

    const result: {
      title: string;
      description: string;
      type: "positive" | "negative" | "neutral";
    }[] = [];

    /*
     * PRICE + VOLUME
     */

    if (
      stock.priceChange > 2 &&
      volumeRatio > 1.2
    ) {
      result.push({
        title: "Strong Buying Momentum",
        description:
          "The stock is moving higher with above-average trading activity, suggesting strong market participation.",
        type: "positive",
      });
    }

    if (
      stock.priceChange < -2 &&
      volumeRatio > 1.2
    ) {
      result.push({
        title: "Selling Pressure Detected",
        description:
          "The price decline is supported by elevated trading volume, indicating increased selling activity.",
        type: "negative",
      });
    }

    if (
      stock.priceChange > 0 &&
      volumeRatio < 0.8
    ) {
      result.push({
        title: "Weak Volume Confirmation",
        description:
          "The price is rising, but trading participation remains below average.",
        type: "neutral",
      });
    }

    /*
     * RSI
     */

    const rsi = stock.indicators?.rsi;

    if (rsi !== undefined) {
      if (rsi >= 70) {
        result.push({
          title: "Potentially Overbought",
          description:
            `RSI is currently ${rsi.toFixed(
              1,
            )}, indicating strong momentum but increased risk of a pullback.`,
          type: "neutral",
        });
      }

      if (rsi <= 30) {
        result.push({
          title: "Potentially Oversold",
          description:
            `RSI is currently ${rsi.toFixed(
              1,
            )}, suggesting the stock may be experiencing heavy selling pressure.`,
          type: "positive",
        });
      }

      if (rsi > 50 && rsi < 70) {
        result.push({
          title: "Healthy Momentum",
          description:
            `RSI at ${rsi.toFixed(
              1,
            )} suggests positive momentum without entering traditionally overbought territory.`,
          type: "positive",
        });
      }
    }

    /*
     * DEFAULT
     */

    if (!result.length) {
      result.push({
        title: "Market Activity Normal",
        description:
          "Current price movement and trading activity remain within normal ranges.",
        type: "neutral",
      });
    }

    return result;
  }, [stock, volumeRatio]);

  /* ========================================
     LOADING
  ======================================== */

  if (loading) {
    return <DashboardSkeleton />;
  }

  /* ========================================
     ERROR
  ======================================== */

  if (error || !stock) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-red-400/10
          bg-red-400/[0.03]
          p-6
        "
      >
        <p className="text-sm font-light text-red-200/70">
          {error || "Unable to load stock data."}
        </p>
      </div>
    );
  }

  /* ========================================
     CHANGE TEXT
  ======================================== */

  const changeText =
    `${isPositive ? "+" : ""}${stock.priceChange.toFixed(
      2,
    )}%`;

  const rangeOptions: Range[] = [
    "1D",
    "1W",
    "1M",
    "3M",
    "6M",
    "1Y",
  ];

  const indicatorData = [
    {
      name: "Momentum",
      value: pulseAnalysis.momentum,
    },
    {
      name: "Volume",
      value: pulseAnalysis.volume,
    },
    {
      name: "Technical",
      value: pulseAnalysis.technical,
    },
    {
      name: "Risk",
      value: pulseAnalysis.risk,
    },
  ];

  /* ========================================
     RENDER
  ======================================== */

  return (
    <div className="space-y-6">
      {/* ========================================
          MAIN HEADER
      ======================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          border-white/[0.07]
          bg-[#06142D]
          p-6
          md:p-8
        "
      >
        {/* AMBIENT LIGHT */}

        <div
          className="
            pointer-events-none
            absolute
            right-[-120px]
            top-[-120px]
            h-[320px]
            w-[320px]
            rounded-full
            bg-blue-500/[0.08]
            blur-[120px]
          "
        />

        <div className="relative">
          <div
            className="
              flex
              flex-col
              justify-between
              gap-8
              lg:flex-row
              lg:items-start
            "
          >
            {/* COMPANY */}

            <div>
              <div className="flex items-center gap-4">
                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-blue-400/15
                    bg-blue-400/[0.08]
                    text-sm
                    font-medium
                    text-blue-200
                  "
                >
                  {stock.symbol.slice(0, 3)}
                </div>

                <div>
                  <h2
                    className="
                      text-2xl
                      font-light
                      tracking-[-0.03em]
                      text-white
                    "
                  >
                    {stock.symbol}
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    {stock.companyName}
                  </p>
                </div>
              </div>

              {/* PRICE */}

              <p
                className="
                  mt-10
                  text-[10px]
                  uppercase
                  tracking-[0.22em]
                  text-white/30
                "
              >
                Current market price
              </p>

              <div
                className="
                  mt-3
                  flex
                  flex-wrap
                  items-end
                  gap-4
                "
              >
                <h1
                  className="
                    text-4xl
                    font-light
                    tracking-[-0.05em]
                    text-white
                    md:text-6xl
                  "
                >
                  {formatPrice(
                    stock.price,
                    stock.currency,
                  )}
                </h1>

                <div
                  className={`
                    mb-1
                    rounded-lg
                    border
                    px-3
                    py-1.5
                    text-sm
                    ${
                      isPositive
                        ? `
                          border-emerald-400/15
                          bg-emerald-400/[0.08]
                          text-emerald-300
                        `
                        : `
                          border-red-400/15
                          bg-red-400/[0.08]
                          text-red-300
                        `
                    }
                  `}
                >
                  {changeText}
                </div>
              </div>
            </div>

            {/* PULSE SCORE */}

            <div
              className="
                min-w-[240px]
                rounded-2xl
                border
                border-white/[0.07]
                bg-white/[0.025]
                p-5
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
                Pulse score
              </p>

              <div className="mt-4 flex items-end gap-3">
                <span
                  className="
                    text-5xl
                    font-light
                    tracking-[-0.04em]
                    text-white
                  "
                >
                  {pulseAnalysis.score}
                </span>

                <span className="mb-2 text-sm text-white/30">
                  / 100
                </span>
              </div>

              <div
                className={`
                  mt-4
                  inline-flex
                  rounded-full
                  border
                  px-3
                  py-1
                  text-xs
                  ${
                    pulseAnalysis.score >= 60
                      ? `
                        border-emerald-400/15
                        bg-emerald-400/[0.08]
                        text-emerald-300
                      `
                      : pulseAnalysis.score >= 45
                        ? `
                          border-yellow-400/15
                          bg-yellow-400/[0.08]
                          text-yellow-300
                        `
                        : `
                          border-red-400/15
                          bg-red-400/[0.08]
                          text-red-300
                        `
                  }
                `}
              >
                {pulseAnalysis.trend}
              </div>

              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="
                    h-full
                    rounded-full
                    bg-blue-400
                    transition-all
                    duration-700
                  "
                  style={{
                    width: `${pulseAnalysis.score}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* METRICS */}

          <div
            className="
              mt-10
              grid
              grid-cols-2
              gap-3
              md:grid-cols-4
            "
          >
            <Metric
              label="Previous close"
              value={formatPrice(
                stock.previousClose,
                stock.currency,
              )}
            />

            <Metric
              label="Volume"
              value={formatCompactNumber(stock.volume)}
            />

            <Metric
              label="Average volume"
              value={formatCompactNumber(
                stock.averageVolume,
              )}
            />

            <Metric
              label="Volume ratio"
              value={`${volumeRatio.toFixed(2)}x`}
              positive={volumePositive}
            />
          </div>
        </div>
      </section>

      {/* ========================================
          PRICE CHART
      ======================================== */}

      <section
        className="
          rounded-2xl
          border
          border-white/[0.07]
          bg-[#06142D]
          p-5
          md:p-7
        "
      >
        <div
          className="
            mb-8
            flex
            flex-col
            justify-between
            gap-5
            md:flex-row
            md:items-center
          "
        >
          <div>
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.2em]
                text-white/30
              "
            >
              Market performance
            </p>

            <h3 className="mt-2 text-xl font-light text-white">
              Price movement
            </h3>
          </div>

          {/* RANGE SELECTOR */}

          <div
            className="
              flex
              w-full
              gap-1
              overflow-x-auto
              rounded-xl
              border
              border-white/[0.06]
              bg-white/[0.025]
              p-1
              md:w-auto
            "
          >
            {rangeOptions.map((range) => (
              <button
                key={range}
                onClick={() =>
                  setSelectedRange(range)
                }
                className={`
                  rounded-lg
                  px-3
                  py-2
                  text-xs
                  transition

                  ${
                    selectedRange === range
                      ? `
                        bg-blue-500/15
                        text-blue-200
                      `
                      : `
                        text-white/35
                        hover:bg-white/[0.04]
                        hover:text-white/60
                      `
                  }
                `}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {chartData.length ? (
          <div className="h-[360px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="priceGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#60A5FA"
                      stopOpacity={0.35}
                    />

                    <stop
                      offset="100%"
                      stopColor="#60A5FA"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tick={{
                    fill: "rgba(255,255,255,0.3)",
                    fontSize: 11,
                  }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={30}
                />

                <YAxis
                  domain={["auto", "auto"]}
                  tick={{
                    fill: "rgba(255,255,255,0.3)",
                    fontSize: 11,
                  }}
                  tickLine={false}
                  axisLine={false}
                  width={65}
                  tickFormatter={(value) =>
                    formatNumber(value)
                  }
                />

                <Tooltip
                  contentStyle={{
                    background: "#08172f",
                    border:
                      "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  labelStyle={{
                    color: "rgba(255,255,255,0.45)",
                  }}
                  formatter={(value: number) => [
                    formatPrice(
                      value,
                      stock.currency,
                    ),
                    "Price",
                  ]}
                />

                <ReferenceLine
                  y={stock.previousClose}
                  stroke="rgba(255,255,255,0.18)"
                  strokeDasharray="4 4"
                />

                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                  activeDot={{
                    r: 5,
                    fill: "#93C5FD",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <ChartEmptyState
            title="Price history unavailable"
            description="Connect historical market data to display performance charts."
          />
        )}
      </section>

      {/* ========================================
          VOLUME + TECHNICAL
      ======================================== */}

      <div
        className="
          grid
          gap-6
          xl:grid-cols-2
        "
      >
        {/* VOLUME CHART */}

        <section
          className="
            rounded-2xl
            border
            border-white/[0.07]
            bg-[#06142D]
            p-5
            md:p-7
          "
        >
          <div className="mb-7">
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.2em]
                text-white/30
              "
            >
              Trading activity
            </p>

            <h3 className="mt-2 text-xl font-light text-white">
              Volume analysis
            </h3>
          </div>

          {chartData.length ? (
            <div className="h-[280px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tick={{
                      fill:
                        "rgba(255,255,255,0.3)",
                      fontSize: 10,
                    }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={25}
                  />

                  <YAxis
                    tickFormatter={(value) =>
                      formatCompactNumber(value)
                    }
                    tick={{
                      fill:
                        "rgba(255,255,255,0.3)",
                      fontSize: 10,
                    }}
                    tickLine={false}
                    axisLine={false}
                    width={55}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#08172f",
                      border:
                        "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                    }}
                    formatter={(value: number) => [
                      formatCompactNumber(value),
                      "Volume",
                    ]}
                  />

                  <Bar
                    dataKey="volume"
                    radius={[4, 4, 0, 0]}
                  >
                    {chartData.map((entry, index) => {
                      const isUp =
                        entry.close >=
                        (entry.open ?? entry.close);

                      return (
                        <Cell
                          key={`volume-${index}`}
                          fill={
                            isUp
                              ? "rgba(52,211,153,0.55)"
                              : "rgba(248,113,113,0.55)"
                          }
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ChartEmptyState
              title="Volume history unavailable"
              description="Historical volume data will appear here."
            />
          )}

          <div
            className="
              mt-6
              grid
              grid-cols-3
              gap-3
              border-t
              border-white/[0.06]
              pt-5
            "
          >
            <MiniMetric
              label="Current"
              value={formatCompactNumber(stock.volume)}
            />

            <MiniMetric
              label="Average"
              value={formatCompactNumber(
                stock.averageVolume,
              )}
            />

            <MiniMetric
              label="Status"
              value={volumeStatus}
              positive={volumePositive}
            />
          </div>
        </section>

        {/* TECHNICAL ANALYSIS */}

        <section
          className="
            rounded-2xl
            border
            border-white/[0.07]
            bg-[#06142D]
            p-5
            md:p-7
          "
        >
          <div className="mb-7">
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.2em]
                text-white/30
              "
            >
              Technical analysis
            </p>

            <h3 className="mt-2 text-xl font-light text-white">
              Market indicators
            </h3>
          </div>

          <div className="space-y-3">
            <TechnicalRow
              label="Trend"
              value={pulseAnalysis.trend}
              positive={
                pulseAnalysis.score >= 60
              }
            />

            <TechnicalRow
              label="RSI"
              value={
                stock.indicators?.rsi !== undefined
                  ? stock.indicators.rsi.toFixed(1)
                  : "—"
              }
            />

            <TechnicalRow
              label="20 Day Average"
              value={
                stock.indicators?.sma20
                  ? formatPrice(
                      stock.indicators.sma20,
                      stock.currency,
                    )
                  : "—"
              }
            />

            <TechnicalRow
              label="50 Day Average"
              value={
                stock.indicators?.sma50
                  ? formatPrice(
                      stock.indicators.sma50,
                      stock.currency,
                    )
                  : "—"
              }
            />

            <TechnicalRow
              label="Support"
              value={
                stock.indicators?.support
                  ? formatPrice(
                      stock.indicators.support,
                      stock.currency,
                    )
                  : "—"
              }
            />

            <TechnicalRow
              label="Resistance"
              value={
                stock.indicators?.resistance
                  ? formatPrice(
                      stock.indicators.resistance,
                      stock.currency,
                    )
                  : "—"
              }
            />
          </div>

          {/* RSI EXPLANATION */}

          {stock.indicators?.rsi !== undefined && (
            <div
              className="
                mt-6
                rounded-xl
                border
                border-white/[0.06]
                bg-white/[0.025]
                p-4
              "
            >
              <p className="text-xs leading-relaxed text-white/40">
                RSI measures market momentum. Values
                above 70 may indicate overbought
                conditions, while values below 30 may
                indicate oversold conditions.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ========================================
          PULSE BREAKDOWN
      ======================================== */}

      <section
        className="
          rounded-2xl
          border
          border-white/[0.07]
          bg-[#06142D]
          p-5
          md:p-7
        "
      >
        <div
          className="
            mb-8
            flex
            flex-col
            justify-between
            gap-4
            md:flex-row
            md:items-end
          "
        >
          <div>
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.2em]
                text-white/30
              "
            >
              Pulse intelligence
            </p>

            <h3 className="mt-2 text-xl font-light text-white">
              Signal breakdown
            </h3>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm text-white/35">
              Overall confidence
            </p>

            <p className="mt-1 text-2xl font-light text-white">
              {pulseAnalysis.score}%
            </p>
          </div>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={indicatorData}
              layout="vertical"
              margin={{
                left: 20,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                horizontal={false}
              />

              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{
                  fill:
                    "rgba(255,255,255,0.3)",
                  fontSize: 11,
                }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                type="category"
                dataKey="name"
                tick={{
                  fill:
                    "rgba(255,255,255,0.5)",
                  fontSize: 12,
                }}
                tickLine={false}
                axisLine={false}
                width={90}
              />

              <Tooltip
                contentStyle={{
                  background: "#08172f",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                }}
              />

              <Bar
                dataKey="value"
                radius={[0, 6, 6, 0]}
                fill="rgba(96,165,250,0.75)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ========================================
          MARKET INSIGHTS
      ======================================== */}

      <section
        className="
          rounded-2xl
          border
          border-white/[0.07]
          bg-[#06142D]
          p-5
          md:p-7
        "
      >
        <div className="mb-7">
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-white/30
            "
          >
            Market intelligence
          </p>

          <h3 className="mt-2 text-xl font-light text-white">
            Pulse insights
          </h3>
        </div>

        <div
          className="
            grid
            gap-4
            lg:grid-cols-3
          "
        >
          {insights.map((insight, index) => (
            <InsightCard
              key={index}
              {...insight}
            />
          ))}
        </div>
      </section>

      {/* ========================================
          FOOTER CONTEXT
      ======================================== */}

      <div
        className="
          rounded-xl
          border
          border-white/[0.05]
          bg-white/[0.015]
          px-5
          py-4
        "
      >
        <p className="text-xs leading-relaxed text-white/30">
          Pulse evaluates price momentum, trading
          activity and available technical indicators
          to generate a simplified market signal.
          This analysis is informational and should
          not be considered financial advice.
        </p>
      </div>
    </div>
  );
}

/* ========================================
   METRIC
======================================== */

interface MetricProps {
  label: string;
  value: string;
  positive?: boolean;
}

function Metric({
  label,
  value,
  positive,
}: MetricProps) {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/[0.06]
        bg-white/[0.025]
        p-4
      "
    >
      <p
        className="
          text-[10px]
          uppercase
          tracking-[0.14em]
          text-white/25
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-3
          truncate
          text-lg
          font-light

          ${
            positive === undefined
              ? "text-white/80"
              : positive
                ? "text-emerald-300"
                : "text-red-300"
          }
        `}
      >
        {value}
      </p>
    </div>
  );
}

/* ========================================
   MINI METRIC
======================================== */

interface MiniMetricProps {
  label: string;
  value: string;
  positive?: boolean;
}

function MiniMetric({
  label,
  value,
  positive,
}: MiniMetricProps) {
  return (
    <div>
      <p
        className="
          text-[9px]
          uppercase
          tracking-[0.14em]
          text-white/25
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-2
          truncate
          text-sm

          ${
            positive === undefined
              ? "text-white/70"
              : positive
                ? "text-emerald-300"
                : "text-red-300"
          }
        `}
      >
        {value}
      </p>
    </div>
  );
}

/* ========================================
   TECHNICAL ROW
======================================== */

interface TechnicalRowProps {
  label: string;
  value: string;
  positive?: boolean;
}

function TechnicalRow({
  label,
  value,
  positive,
}: TechnicalRowProps) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        rounded-xl
        border
        border-white/[0.05]
        bg-white/[0.02]
        px-4
        py-3
      "
    >
      <span className="text-sm text-white/40">
        {label}
      </span>

      <span
        className={`
          text-sm
          ${
            positive === undefined
              ? "text-white/80"
              : positive
                ? "text-emerald-300"
                : "text-red-300"
          }
        `}
      >
        {value}
      </span>
    </div>
  );
}

/* ========================================
   INSIGHT CARD
======================================== */

interface InsightCardProps {
  title: string;
  description: string;
  type: "positive" | "negative" | "neutral";
}

function InsightCard({
  title,
  description,
  type,
}: InsightCardProps) {
  const styles = {
    positive:
      "border-emerald-400/10 bg-emerald-400/[0.025]",
    negative:
      "border-red-400/10 bg-red-400/[0.025]",
    neutral:
      "border-blue-400/10 bg-blue-400/[0.025]",
  };

  const dotStyles = {
    positive: "bg-emerald-400",
    negative: "bg-red-400",
    neutral: "bg-blue-400",
  };

  return (
    <div
      className={`
        rounded-xl
        border
        p-5
        ${styles[type]}
      `}
    >
      <div className="flex items-center gap-2">
        <span
          className={`
            h-1.5
            w-1.5
            rounded-full
            ${dotStyles[type]}
          `}
        />

        <p className="text-sm text-white/80">
          {title}
        </p>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-white/40">
        {description}
      </p>
    </div>
  );
}

/* ========================================
   EMPTY CHART
======================================== */

interface ChartEmptyStateProps {
  title: string;
  description: string;
}

function ChartEmptyState({
  title,
  description,
}: ChartEmptyStateProps) {
  return (
    <div
      className="
        flex
        h-[280px]
        flex-col
        items-center
        justify-center
        rounded-xl
        border
        border-dashed
        border-white/[0.08]
        bg-white/[0.015]
        text-center
      "
    >
      <p className="text-sm text-white/55">
        {title}
      </p>

      <p className="mt-2 max-w-sm text-xs text-white/25">
        {description}
      </p>
    </div>
  );
}

/* ========================================
   LOADING SKELETON
======================================== */

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          border-white/[0.06]
          bg-[#06142D]
          p-7
        "
      >
        <div
          className="
            absolute
            inset-0
            animate-pulse
            bg-gradient-to-r
            from-transparent
            via-blue-400/[0.025]
            to-transparent
          "
        />

        <div className="relative">
          <div className="h-5 w-32 rounded bg-white/[0.06]" />

          <div className="mt-6 h-14 w-56 rounded bg-white/[0.07]" />

          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-24 rounded-xl bg-white/[0.04]"
              />
            ))}
          </div>
        </div>
      </div>

      {/* CHART */}

      <div
        className="
          h-[430px]
          animate-pulse
          rounded-2xl
          border
          border-white/[0.06]
          bg-[#06142D]
        "
      />

      {/* GRID */}

      <div className="grid gap-6 xl:grid-cols-2">
        <div
          className="
            h-[400px]
            animate-pulse
            rounded-2xl
            border
            border-white/[0.06]
            bg-[#06142D]
          "
        />

        <div
          className="
            h-[400px]
            animate-pulse
            rounded-2xl
            border
            border-white/[0.06]
            bg-[#06142D]
          "
        />
      </div>
    </div>
  );
}

export default StockDetails;
