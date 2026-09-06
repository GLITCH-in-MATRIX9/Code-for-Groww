import { useId } from "react";

/* ============================================================
   FLOW — connector between diagram rows.
   Same visual language as AIIntelligence's VFlow: a soft
   rgba(103,183,255,0.25) line with a white-to-blue radial
   gradient particle travelling along it under a real glow
   filter. Supports 1→1, 1→N (fan-out) and N→1 (fan-in) by
   passing arrays of x-positions (0–1 fractions of the row width).
============================================================ */

function Flow({
  from,
  to,
  height = 64,
}: {
  from: number[];
  to: number[];
  height?: number;
}) {
  const rawId = useId();
  const uid = rawId.replace(/[:]/g, "");
  const w = 300;

  const pairs: Array<[number, number]> =
    from.length === 1
      ? to.map((t) => [from[0], t])
      : to.length === 1
      ? from.map((f) => [f, to[0]])
      : from.map((f, i) => [f, to[i] ?? to[0]]);

  return (
    <svg
      className="pointer-events-none w-full overflow-visible"
      style={{ height }}
      viewBox={`0 0 ${w} 100`}
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <filter id={`glow-${uid}`} x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`particle-${uid}`}>
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#8DD0FF" />
          <stop offset="100%" stopColor="#225BE6" />
        </radialGradient>
      </defs>

      {pairs.map(([fx, tx], i) => {
        const x1 = fx * w;
        const x2 = tx * w;
        const d = `M ${x1} 0 C ${x1} 46, ${x2} 46, ${x2} 100`;
        return (
          <g key={i}>
            <path d={d} stroke="rgba(103,183,255,0.25)" strokeWidth={1.5} />
            <circle r={5} fill={`url(#particle-${uid})`} filter={`url(#glow-${uid})`}>
              <animateMotion
                dur={`${2.6 + i * 0.5}s`}
                begin={`${i * 0.35}s`}
                repeatCount="indefinite"
                path={d}
              />
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

/* ============================================================
   NODE — generic card used throughout the diagram.
   Reskinned to match AIIntelligence's SignalCard: a dot + eyebrow
   label on the left, an optional status pill on the right.
============================================================ */

function Node({
  eyebrow,
  title,
  detail,
  status,
  dot = "bg-[#67B7FF]",
  emphasis = "default",
  className = "",
  children,
}: {
  eyebrow?: string;
  title: string;
  detail?: string;
  status?: string;
  dot?: string;
  emphasis?: "default" | "muted" | "accent";
  className?: string;
  children?: React.ReactNode;
}) {
  const styles = {
    default:
      "border-white/[0.08] bg-[#0B111E]/95 text-white/85 hover:border-[#67B7FF]/20 hover:bg-[#0D1525]",
    muted:
      "border-white/[0.05] bg-white/[0.025] text-white/60",
    accent:
      "border-[#67B7FF]/20 bg-[#225BE6]/10 text-white",
  }[emphasis];

  return (
    <div
      className={`rounded-xl border p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm transition duration-500 ${styles} ${className}`}
    >
      {(eyebrow || status) && (
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            {eyebrow && (
              <p className="text-[9px] font-light uppercase tracking-[0.18em] text-white/40">
                {eyebrow}
              </p>
            )}
          </div>
          {status && (
            <span className="text-[8px] tracking-[0.12em] text-white/25">
              {status}
            </span>
          )}
        </div>
      )}
      <p className="text-[13px] leading-snug">{title}</p>
      {detail && (
        <p className="mt-1.5 text-[11px] font-light leading-relaxed text-white/35">
          {detail}
        </p>
      )}
      {children}
    </div>
  );
}

/* ============================================================
   SYSTEM LABEL — the small top-corner strip used on the diagram
   frame, matching AIIntelligence's "Input Signals / Deterministic
   Intelligence / AI Context" row.
============================================================ */

function SystemLabel({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="hidden items-center gap-3 lg:flex">
      <span className={`h-2 w-2 rounded-full ${dot} shadow-[0_0_15px_currentColor]`} />
      <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">{label}</p>
    </div>
  );
}

/* ============================================================
   ARCHITECTURE SECTION
============================================================ */

function Architecture() {
  return (
    <section
      id="architecture"
      className="relative min-h-screen w-full overflow-hidden bg-[#060914] py-24 text-white md:py-32"
    >
      {/* ========================================
          BACKGROUND — SUBTLE DOT GRID
      ======================================== */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.16]
          [background-image:radial-gradient(circle_at_1px_1px,rgba(120,170,255,0.8)_1px,transparent_0)]
          [background-size:22px_22px]
        "
      />

      {/* AMBIENT GLOWS */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#225BE6]/10 blur-[180px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-[#4DA3FF]/10 blur-[200px]" />

      {/* ========================================
          SECTION HEADER
      ======================================== */}
      <div className="relative z-10 mx-auto max-w-[1500px] px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl">
          <div className="mb-8 flex items-center gap-4">
            <div className="h-px w-10 bg-[#67B7FF]" />
            <p className="text-[10px] font-light uppercase tracking-[0.3em] text-[#67B7FF]/70">
              Architecture
            </p>
          </div>

          <h2 className="text-5xl font-light leading-[1.05] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
            How a price move
            <br />
            <span className="text-white/35">becomes a reason.</span>
          </h2>

          <p className="mt-8 max-w-2xl text-base font-light leading-relaxed text-white/50 md:text-lg">
            Every stock on your watchlist runs through the same pipeline 
            <br />
            data comes in, Pulse decides whether it matters, and only then
            does it reach you.
          </p>
        </div>
      </div>

      {/* ========================================
          SYSTEM CANVAS
      ======================================== */}
      <div className="relative z-10 mx-auto mt-20 max-w-[1600px] px-4 md:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#080C16]/90 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
          {/* INTERNAL GRID */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              opacity-[0.09]
              [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)]
              [background-size:70px_70px]
            "
          />

          {/* SYSTEM LABELS */}
          <div className="relative z-10 hidden items-center justify-between px-10 pt-8 lg:flex">
            <SystemLabel dot="bg-[#67B7FF] text-[#67B7FF]" label="Market Signals" />
            <SystemLabel dot="bg-[#4D7CFF] text-[#4D7CFF]" label="Deterministic Intelligence" />
            <SystemLabel dot="bg-[#8BCBFF] text-[#8BCBFF]" label="AI Context" />
          </div>

          <div className="relative z-10 flex flex-col p-6 pt-16 md:p-10 md:pt-16 lg:p-14 lg:pt-16">
            {/* 1. USER */}
            <Node
              eyebrow="Pulse"
              status="LIVE"
              title="Pulse web application"
              detail="Homepage · Dashboard · Watchlist · Stock insights"
              className="mx-auto w-full max-w-sm text-center"
            />

            <Flow from={[0.5]} to={[0.5]} height={64} />

            {/* 2. API */}
            <Node
              eyebrow="Node.js · Express · TypeScript"
              status="RUNNING"
              dot="bg-[#4D7CFF]"
              title="Pulse API server"
              detail="GET /health · GET /watchlist · GET /stocks/:symbol/analysis · GET /stocks/:symbol/since-last-checked"
              className="mx-auto w-full max-w-xl text-center"
            />

            <Flow from={[0.5]} to={[0.18, 0.5, 0.82]} height={120} />

            {/* 3. THREE ROUTES */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Node
                eyebrow="Route"
                status="ACTIVE"
                title="Stock analysis"
                detail="Triggers analyzePulse(symbol)"
              />
              <Node
                eyebrow="Route"
                status="ACTIVE"
                title="Watchlist management"
                detail="Add · list · remove · update last checked"
              />
              <Node
                eyebrow="Route"
                status="ACTIVE"
                title="Since last checked"
                detail="Compares now against your last visit"
              />
            </div>

            <Flow from={[0.18, 0.82]} to={[0.5]} height={102} />

            {/* 4. MARKET DATA COLLECTION */}
            <div className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Node
                  emphasis="muted"
                  eyebrow="Service"
                  status="POLLING"
                  title="Market data service"
                  detail="Price, previous close, volume, volatility"
                />
                <Flow from={[0.5]} to={[0.5]} height={54} />
                <Node emphasis="muted" title="Yahoo Finance" detail="External source" />
              </div>
              <div className="flex flex-col gap-3">
                <Node
                  emphasis="muted"
                  eyebrow="Service"
                  status="POLLING"
                  title="News service"
                  detail="Company + market news, related events"
                />
                <Flow from={[0.5]} to={[0.5]} height={54} />
                <Node emphasis="muted" title="Finnhub" detail="External source" />
              </div>
            </div>

            <Flow from={[0.25, 0.75]} to={[0.5]} height={102} />

            {/* 5. PULSE ANALYZER — centerpiece */}
            <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-[#67B7FF]/20 bg-gradient-to-br from-[#225BE6]/15 via-[#101D3D] to-[#090F20] p-6 shadow-[0_0_100px_rgba(34,91,230,0.15)] md:p-10">
              <div className="pointer-events-none absolute -top-10 left-1/2 h-[220px] w-[220px] -translate-x-1/2 rounded-full bg-[#225BE6]/25 blur-[70px]" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#67B7FF] shadow-[0_0_14px_#67B7FF]" />
                  <p className="text-[9px] uppercase tracking-[0.22em] text-white/45">
                    Pulse Analyzer
                  </p>
                </div>
                <span className="rounded-full border border-[#67B7FF]/20 bg-[#67B7FF]/10 px-2.5 py-1 text-[8px] tracking-[0.14em] text-[#67B7FF]">
                  RUNNING
                </span>
              </div>

              <p className="relative mx-auto mt-6 max-w-md text-center text-xs font-light leading-relaxed text-white/45">
                One symbol goes in. Six processing stages run in sequence to
                decide what actually changed.
              </p>

              {/* internal stage pipeline */}
              <div className="relative mt-8 flex flex-col gap-2 md:flex-row md:flex-wrap md:justify-center md:gap-3">
                {[
                  "Market data collection",
                  "Signal processing",
                  "Price change analysis",
                  "Volume analysis",
                  "Volatility analysis",
                  "News signal detection",
                ].map((stage, i, arr) => (
                  <div key={stage} className="flex items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-light text-white/70">
                      {stage}
                    </span>
                    {i < arr.length - 1 && (
                      <span className="hidden text-[#67B7FF]/50 md:inline">→</span>
                    )}
                  </div>
                ))}
              </div>

              {/* meaningfulness scoring */}
              <div className="relative mt-10 rounded-2xl border border-white/10 bg-black/20 p-5 md:p-7">
                <p className="text-center text-[9px] uppercase tracking-[0.22em] text-white/30">
                  Evaluation Complete
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  {["Price signal", "Volume signal", "Volatility signal", "News signal"].map(
                    (s, i) => (
                      <div key={s} className="flex items-center gap-3">
                        <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-light text-white/60">
                          {s}
                        </span>
                        {i < 3 && <span className="text-white/25">+</span>}
                      </div>
                    ),
                  )}
                </div>

                <div className="mt-5 flex justify-center">
                  <span className="text-[#67B7FF]/50">↓</span>
                </div>

                <div className="mt-3 text-center">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                    Meaningfulness Score
                  </p>
                  <p className="mt-2 text-6xl font-extralight tracking-[-0.05em] text-[#67B7FF] drop-shadow-[0_0_25px_rgba(103,183,255,0.4)]">
                    10
                  </p>
                  <div className="mt-4 flex justify-center gap-1.5">
                    {["Low", "Medium", "High", "Critical"].map((sev) => (
                      <span
                        key={sev}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/50"
                      >
                        {sev}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Flow from={[0.5]} to={[0.25, 0.75]} height={102} />

            {/* 6. SNAPSHOT + AI, side by side */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* snapshot branch */}
              <div className="flex flex-col gap-3">
                <Node
                  eyebrow="Snapshot system"
                  status="STORED"
                  dot="bg-[#225BE6]"
                  title="saveSnapshot()"
                  detail="Persists this analysis as a point-in-time record"
                />
                <Flow from={[0.5]} to={[0.5]} height={32} />
                <div className="grid grid-cols-2 gap-3">
                  <Node
                    emphasis="muted"
                    eyebrow="Neon PostgreSQL"
                    title="stock_snapshots"
                    detail="price · volume · volatility · score · severity"
                  />
                  <Node
                    emphasis="muted"
                    eyebrow="Neon PostgreSQL"
                    title="watchlist_items"
                    detail="symbol · company · last checked"
                  />
                </div>
              </div>

              {/* AI branch */}
              <div className="flex flex-col gap-3">
                <Node
                  eyebrow="AI service"
                  status="QWEN"
                  dot="bg-[#8BCBFF]"
                  title="Prompt Builder → Qwen (via Ollama)"
                  detail="Turns the score and reasons into plain language"
                />
                <Flow from={[0.5]} to={[0.25, 0.75]} height={40} />
                <div className="grid grid-cols-2 gap-3">
                  <Node
                    emphasis="accent"
                    eyebrow="On success"
                    title="AI explanation"
                    detail="Headline · explanation · why it matters"
                  />
                  <Node
                    emphasis="muted"
                    eyebrow="On timeout / failure"
                    title="Deterministic fallback"
                    detail="Rule-based explanation, no AI dependency"
                  />
                </div>
              </div>
            </div>

            <Flow from={[0.25, 0.75]} to={[0.5]} height={102} />

            {/* 7. SINCE LAST CHECKED */}
            <Node
              eyebrow="Comparison engine"
              status="ACTIVE"
              dot="bg-[#4D7CFF]"
              title="Since last checked"
              detail="getWatchlistItem() → compares the new snapshot against the previous one → generates meaningful changes → updateLastChecked()"
              className="mx-auto w-full max-w-2xl text-center"
            />

            <Flow from={[0.5]} to={[0.5]} height={48} />

            {/* 8. DASHBOARD */}
            <Node
              emphasis="accent"
              status="READY"
              title="Dashboard insight"
              detail="Meaningful context, not more information"
              className="mx-auto w-full max-w-sm text-center"
            />
          </div>
        </div>
      </div>

      
    </section>
  );
}

export default Architecture;