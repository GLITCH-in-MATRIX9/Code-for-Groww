import {
  useEffect,
  useId,
  useMemo,
  useState
} from "react";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";


interface PerformancePoint {

  label: string;

  value: number;

}


interface PerformanceResponse {

  totalStocks: number;

  gainers: number;

  losers: number;

  unchanged: number;

  data: PerformancePoint[];

}


const RANGES = [
  {
    label: "Today",
    value: "today"
  },

  {
    label: "1 Week",
    value: "week"
  },

  {
    label: "1 Month",
    value: "month"
  }

] as const;


type RangeValue =
  typeof RANGES[number]["value"];


/* ========================================
   TREND COLORS

   One accent, chosen by the data itself:
   green when the range is up, rose when
   it's down, neutral white when flat or
   there isn't enough data to say.
======================================== */

const TREND = {

  up: {
    stroke: "rgba(52,211,153,0.85)",
    fill: "rgba(52,211,153,0.7)",
    text: "text-emerald-400/80",
    dot: "bg-emerald-400/70"
  },

  down: {
    stroke: "rgba(248,113,113,0.85)",
    fill: "rgba(248,113,113,0.7)",
    text: "text-rose-400/80",
    dot: "bg-rose-400/70"
  },

  flat: {
    stroke: "rgba(255,255,255,0.55)",
    fill: "rgba(255,255,255,0.4)",
    text: "text-white/60",
    dot: "bg-white/40"
  }

} as const;


function getTrend(
  data: PerformancePoint[]
): keyof typeof TREND {

  if (data.length < 2) return "flat";

  const first = data[0].value;

  const last = data[data.length - 1].value;

  if (last > first) return "up";

  if (last < first) return "down";

  return "flat";

}


function formatCompact(value: number) {

  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);

}


function WatchlistPerformanceChart() {


  const gradientId = useId();


  const [range, setRange] =
    useState<RangeValue>("today");


  const [performance, setPerformance] =
    useState<PerformanceResponse | null>(
      null
    );


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {


    async function fetchPerformance() {

      try {

        setLoading(true);

        setError(null);


        const response =
          await fetch(
            `http://localhost:3001/api/dashboard/performance?range=${range}`
          );


        if (!response.ok) {

          throw new Error(
            "Failed to fetch performance data."
          );

        }


        const data: PerformanceResponse =
          await response.json();


        setPerformance(data);

      }

      catch (error) {

        console.error(
          "Failed to load watchlist performance:",
          error
        );


        setError(
          "Unable to load watchlist performance."
        );

      }

      finally {

        setLoading(false);

      }

    }


    fetchPerformance();


  }, [range]);


  const trend = useMemo(
    () =>
      getTrend(
        performance?.data ?? []
      ),
    [performance]
  );


  const colors = TREND[trend];


  const totalClassified =
    (performance?.gainers ?? 0) +
    (performance?.losers ?? 0) +
    (performance?.unchanged ?? 0);


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


      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >

        <div>

          <p
            className="
              text-[10px]
              font-light
              uppercase
              tracking-[0.2em]
              text-white/35
            "
          >
            Watchlist Performance
          </p>


          <div
            className="
              mt-2
              flex
              items-baseline
              gap-2
            "
          >

            <span
              className="
                text-2xl
                font-light
                text-white/85
              "
            >

              {loading
                ? "—"
                : performance?.totalStocks ?? 0}

            </span>


            <span
              className="
                text-xs
                font-light
                text-white/40
              "
            >
              stocks tracked
            </span>

          </div>

        </div>


        {/* RANGE SELECTOR */}

        <div
          className="
            flex
            gap-1
            rounded-full
            border
            border-white/[0.08]
            bg-white/[0.02]
            p-1
          "
        >

          {RANGES.map((option) => (

            <button
              key={option.value}

              type="button"

              aria-pressed={
                range === option.value
              }

              onClick={() =>
                setRange(option.value)
              }

              className={`
                rounded-full
                px-3
                py-1.5
                text-[11px]
                font-light
                transition
                focus-visible:outline
                focus-visible:outline-1
                focus-visible:outline-white/40

                ${
                  range === option.value

                    ? "bg-white/10 text-white/80"

                    : "text-white/35 hover:text-white/60"
                }
              `}
            >

              {option.label}

            </button>

          ))}

        </div>

      </div>


      {/* SUMMARY: proportional bar + counts */}

      {!loading && performance && totalClassified > 0 && (

        <div className="mt-6">

          <div
            className="
              flex
              h-1
              w-full
              overflow-hidden
              rounded-full
              bg-white/[0.04]
            "
          >

            <div
              className="h-full bg-emerald-400/60"
              style={{
                width: `${(performance.gainers / totalClassified) * 100}%`
              }}
            />

            <div
              className="h-full bg-rose-400/60"
              style={{
                width: `${(performance.losers / totalClassified) * 100}%`
              }}
            />

            <div
              className="h-full bg-white/15"
              style={{
                width: `${(performance.unchanged / totalClassified) * 100}%`
              }}
            />

          </div>


          <div
            className="
              mt-3
              flex
              flex-wrap
              items-center
              gap-5
              text-xs
              font-light
            "
          >

            <span className="flex items-center gap-2 text-white/60">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />

              <span className="text-emerald-400/80">{performance.gainers}</span>{" "}
              gainers

            </span>


            <span className="flex items-center gap-2 text-white/60">

              <span className="h-1.5 w-1.5 rounded-full bg-rose-400/70" />

              <span className="text-rose-400/80">{performance.losers}</span>{" "}
              losers

            </span>


            <span className="flex items-center gap-2 text-white/40">

              <span className="h-1.5 w-1.5 rounded-full bg-white/25" />

              {performance.unchanged} unchanged

            </span>

          </div>

        </div>

      )}


      {/* LOADING — mimics a chart shape rather than a flat block */}

      {loading && (

        <div
          className="
            mt-6
            flex
            h-56
            items-end
            gap-1.5
            overflow-hidden
            rounded-xl
            bg-white/[0.02]
            px-4
            pb-4
          "
        >

          {[38, 58, 44, 70, 52, 66, 48, 74, 60, 40, 55, 65].map(
            (height, i) => (

              <div
                key={i}

                className="
                  flex-1
                  animate-pulse
                  rounded-t-sm
                  bg-white/[0.06]
                "

                style={{
                  height: `${height}%`,
                  animationDelay: `${i * 80}ms`
                }}
              />

            )
          )}

        </div>

      )}


      {/* ERROR */}

      {!loading && error && (

        <div
          className="
            mt-6
            flex
            h-56
            flex-col
            items-center
            justify-center
            gap-3
            rounded-xl
            border
            border-white/[0.06]
          "
        >

          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5" strokeLinecap="round" />
            <circle cx="12" cy="16" r="0.5" fill="rgba(255,255,255,0.3)" />
          </svg>


          <p
            className="
              text-sm
              font-light
              text-white/40
            "
          >

            {error}

          </p>

        </div>

      )}


      {/* EMPTY STATE */}

      {!loading &&
        !error &&
        performance &&
        performance.data.length === 0 && (

          <div
            className="
              mt-6
              flex
              h-56
              flex-col
              items-center
              justify-center
              gap-3
              rounded-xl
              border
              border-white/[0.06]
            "
          >

            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
            >
              <path
                d="M4 18l5-6 4 4 7-9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>


            <p
              className="
                text-sm
                font-light
                text-white/40
              "
            >

              No performance history available yet.

            </p>

          </div>

        )}


      {/* REAL CHART */}

      {!loading &&
        !error &&
        performance &&
        performance.data.length > 0 && (

          <div className="mt-6 h-56 w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <AreaChart
                data={performance.data}
                margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
              >

                <defs>

                  <linearGradient
                    id={gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="0%"
                      stopColor={colors.fill}
                      stopOpacity={0.25}
                    />

                    <stop
                      offset="100%"
                      stopColor={colors.fill}
                      stopOpacity={0}
                    />

                  </linearGradient>

                </defs>


                <XAxis
                  dataKey="label"
                  stroke="rgba(255,255,255,0.15)"
                  tick={{
                    fontSize: 10,
                    fill: "rgba(255,255,255,0.35)"
                  }}
                  axisLine={false}
                  tickLine={false}
                />


                <YAxis
                  tick={{
                    fontSize: 10,
                    fill: "rgba(255,255,255,0.35)"
                  }}
                  tickFormatter={formatCompact}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />


                <Tooltip
                  contentStyle={{
                    background: "#0a0a0a",
                    border:
                      "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    fontSize: "12px"
                  }}

                  labelStyle={{
                    color:
                      "rgba(255,255,255,0.5)"
                  }}

                  itemStyle={{
                    color: colors.stroke
                  }}

                  formatter={(value: number) => [
                    formatCompact(value),
                    "Value"
                  ]}
                />


                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={colors.stroke}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: colors.stroke,
                    stroke: "#0a0a0a",
                    strokeWidth: 2
                  }}
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        )}

    </div>

  );

}


export default WatchlistPerformanceChart;