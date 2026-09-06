import { useId } from "react";

/* ============================================================
   VFLOW — small animated vertical connector between stacked
   blocks. No fixed widths, no horizontal overflow risk.
============================================================ */

function VFlow() {
  const rawId = useId();
  const uid = rawId.replace(/[:]/g, "");
  const d = "M12 0 L12 64";

  return (
    <div className="flex justify-center py-3">
      <svg width={24} height={64} viewBox="0 0 24 64" className="overflow-visible">
        <defs>
          <filter id={`glow-${uid}`} x="-200%" y="-50%" width="500%" height="200%">
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
        <path d={d} fill="none" stroke="rgba(103,183,255,0.35)" strokeWidth={2} />
        <circle r={4} fill={`url(#particle-${uid})`} filter={`url(#glow-${uid})`}>
          <animateMotion dur="2.2s" repeatCount="indefinite" path={d} />
        </circle>
      </svg>
    </div>
  );
}

/* ============================================================
   MAIN SECTION
============================================================ */

function AIIntelligence() {
  return (
    <section
      id="ai"
      className="
        relative
        min-h-screen
        w-full
        overflow-hidden
        bg-[#060914]
        py-24
        text-white
        md:py-32
      "
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

      {/* TOP BLUE AMBIENT GLOW */}

      <div
        className="
          pointer-events-none
          absolute
          left-[25%]
          top-[10%]
          h-[500px]
          w-[500px]
          rounded-full
          bg-[#225BE6]/10
          blur-[180px]
        "
      />

      {/* RIGHT GLOW */}

      <div
        className="
          pointer-events-none
          absolute
          right-[-10%]
          top-[30%]
          h-[600px]
          w-[600px]
          rounded-full
          bg-[#4DA3FF]/10
          blur-[200px]
        "
      />


      {/* ========================================
          SECTION HEADER
      ======================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-[1500px]
          px-6
          md:px-12
          lg:px-20
        "
      >
        <div className="max-w-3xl">

          <div
            className="
              mb-8
              flex
              items-center
              gap-4
            "
          >
            <div className="h-px w-10 bg-[#67B7FF]" />

            <p
              className="
                text-[10px]
                font-light
                uppercase
                tracking-[0.3em]
                text-[#67B7FF]/70
              "
            >
              Intelligence Layer
            </p>
          </div>


          <h2
            className="
              text-5xl
              font-light
              leading-[1.05]
              tracking-[-0.045em]
              text-white
              sm:text-6xl
              lg:text-7xl
            "
          >
            AI explains.

            <br />

            <span className="text-white/35">
              Pulse decides what matters.
            </span>
          </h2>


          <p
            className="
              mt-8
              max-w-2xl
              text-base
              font-light
              leading-relaxed
              text-white/50
              md:text-lg
            "
          >
            Market signals are evaluated using deterministic logic first.
            Only then does AI transform the result into concise,
            human-readable context.
          </p>

        </div>
      </div>


      {/* ========================================
          SYSTEM CANVAS
      ======================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          mt-20
          max-w-[1600px]
          px-4
          md:px-8
          lg:px-12
        "
      >
        <div
          className="
            relative
            overflow-hidden
            rounded-[28px]
            border
            border-white/[0.07]
            bg-[#080C16]/90
            p-6
            shadow-[0_40px_120px_rgba(0,0,0,0.35)]
            lg:p-10
          "
        >

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


          {/* ====================================
              SYSTEM LABELS (desktop only)
          ==================================== */}

          <div className="relative z-10 mb-10 hidden items-center justify-between lg:flex">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#67B7FF] shadow-[0_0_15px_#67B7FF]" />
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                Input Signals
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#4D7CFF] shadow-[0_0_15px_#4D7CFF]" />
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                Deterministic Intelligence
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#8BCBFF] shadow-[0_0_15px_#8BCBFF]" />
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                AI Context
              </p>
            </div>
          </div>


          {/* ====================================
              UNIFIED STACKED FLOW
              Same structure at every breakpoint — no
              separate desktop layout, so nothing needs
              horizontal scrolling. Only the input-card
              grid widens as space allows.
          ==================================== */}

          <div className="relative z-10 mx-auto flex max-w-3xl flex-col">

            {/* INPUTS */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <SignalCard label="Market Data" status="LIVE" dot="bg-[#67B7FF]">
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-light text-white">NVDA</p>
                    <span className="text-xs text-[#67B7FF]">+0.84%</span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-4">
                    <DataPoint label="Volume" value="1.03×" />
                    <DataPoint label="Volatility" value="−40.7%" />
                  </div>
                </div>
              </SignalCard>

              <SignalCard label="News Intelligence" status="DETECTED" dot="bg-[#4D7CFF]">
                <p className="mt-5 text-sm font-light leading-relaxed text-white/60">
                  Company-related news event detected.
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-xs text-white/30">Importance</p>
                  <p className="text-sm text-[#67B7FF]">10 / 10</p>
                </div>
              </SignalCard>

              <SignalCard label="Market Behaviour" status="ANALYZED" dot="bg-[#8BCBFF]">
                <p className="mt-5 text-2xl font-light text-white">−40.76%</p>
                <p className="mt-2 text-xs text-white/35">Volatility change</p>
              </SignalCard>

              <SignalCard label="Historical Memory" status="STORED" dot="bg-[#225BE6]">
                <p className="mt-5 text-sm font-light text-white/60">
                  Previous market snapshot stored.
                </p>
                <p className="mt-3 text-xs text-[#67B7FF]/70">Since Last Checked →</p>
              </SignalCard>

            </div>

            <VFlow />
            <PulseEngine />
            <VFlow />
            <ContextBuilder />
            <VFlow />
            <AIModel />
            <VFlow />
            <ExplanationCard />

          </div>

        </div>
      </div>


      {/* ========================================
          PRINCIPLE / FOOTER
      ======================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          mt-24
          max-w-[1500px]
          px-6
          md:px-12
          lg:px-20
        "
      >
        <div
          className="
            flex
            flex-col
            gap-8
            border-t
            border-white/[0.08]
            pt-10
            md:flex-row
            md:items-end
            md:justify-between
          "
        >
          <p
            className="
              max-w-3xl
              text-2xl
              font-light
              leading-relaxed
              tracking-[-0.025em]
              text-white/55
              md:text-3xl
            "
          >
            The system identifies the signal.

            <span className="text-[#67B7FF]">
              {" "}AI makes the signal understandable.
            </span>
          </p>


          

        </div>
      </div>

    </section>
  );
}


/* ============================================
    REUSABLE SIGNAL CARD
============================================ */

interface SignalCardProps {
  label: string;
  status: string;
  dot: string;
  children: React.ReactNode;
}

function SignalCard({
  label,
  status,
  dot,
  children
}: SignalCardProps) {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/[0.08]
        bg-[#0B111E]/95
        p-5
        shadow-[0_20px_60px_rgba(0,0,0,0.25)]
        transition
        duration-500
        hover:border-[#67B7FF]/20
        hover:bg-[#0D1525]
      "
    >
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span
            className={`
              h-1.5
              w-1.5
              rounded-full
              ${dot}
            `}
          />

          <p
            className="
              text-[9px]
              font-light
              uppercase
              tracking-[0.18em]
              text-white/40
            "
          >
            {label}
          </p>

        </div>


        <span
          className="
            text-[8px]
            tracking-[0.12em]
            text-white/25
          "
        >
          {status}
        </span>

      </div>

      {children}

    </div>
  );
}


/* ============================================
    DATA POINT
============================================ */

function DataPoint({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p
        className="
          text-[8px]
          uppercase
          tracking-[0.15em]
          text-white/25
        "
      >
        {label}
      </p>

      <p className="mt-1 text-sm font-light text-white/70">
        {value}
      </p>

    </div>
  );
}


/* ============================================
    PULSE ENGINE
============================================ */

function PulseEngine() {
  const signals = [
    {
      name: "Price movement",
      value: "+0.84%",
      status: "ANALYZED"
    },
    {
      name: "Volume activity",
      value: "1.03×",
      status: "NORMAL"
    },
    {
      name: "Volatility",
      value: "−40.76%",
      status: "ANALYZED"
    },
    {
      name: "News relevance",
      value: "10",
      status: "DETECTED"
    }
  ];

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-[#67B7FF]/20
        bg-gradient-to-b
        from-[#101B31]
        via-[#0C1424]
        to-[#090E19]
        p-6
        shadow-[0_0_100px_rgba(34,91,230,0.14)]
      "
    >

      {/* AMBIENT ENGINE GLOW */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          h-40
          w-40
          -translate-x-1/2
          rounded-full
          bg-[#225BE6]/20
          blur-[70px]
        "
      />


      <div className="relative">

        {/* ENGINE HEADER */}

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <span
              className="
                h-2
                w-2
                animate-pulse
                rounded-full
                bg-[#67B7FF]
                shadow-[0_0_14px_#67B7FF]
              "
            />

            <p
              className="
                text-[9px]
                uppercase
                tracking-[0.22em]
                text-white/45
              "
            >
              Pulse Signal Engine
            </p>

          </div>


          <span
            className="
              rounded-full
              border
              border-[#67B7FF]/20
              bg-[#67B7FF]/10
              px-2.5
              py-1
              text-[8px]
              tracking-[0.14em]
              text-[#67B7FF]
            "
          >
            RUNNING
          </span>

        </div>


        {/* TITLE */}

        <h3
          className="
            mt-7
            text-2xl
            font-light
            tracking-[-0.025em]
            text-white
          "
        >
          Meaningfulness
          <br />

          <span className="text-white/45">
            Engine
          </span>
        </h3>


        {/* SIGNALS */}

        <div className="mt-7 space-y-3">

          {signals.map((signal) => (

            <div
              key={signal.name}
              className="
                flex
                items-center
                justify-between
                rounded-lg
                border
                border-white/[0.06]
                bg-white/[0.025]
                px-4
                py-3
              "
            >
              <div>

                <p className="text-xs font-light text-white/65">
                  {signal.name}
                </p>

                <p
                  className="
                    mt-1
                    text-[8px]
                    uppercase
                    tracking-[0.14em]
                    text-white/25
                  "
                >
                  {signal.status}
                </p>

              </div>


              <div className="flex items-center gap-2">

                <span
                  className="
                    h-1.5
                    w-1.5
                    animate-pulse
                    rounded-full
                    bg-[#67B7FF]
                  "
                />

                <p className="text-sm font-light text-[#8BCBFF]">
                  {signal.value}
                </p>

              </div>

            </div>

          ))}

        </div>


        {/* EVALUATION */}

        <div
          className="
            mt-6
            border-t
            border-white/[0.08]
            pt-6
          "
        >
          <p
            className="
              text-center
              text-[8px]
              uppercase
              tracking-[0.25em]
              text-white/30
            "
          >
            Evaluation Complete
          </p>


          <div className="mt-5 text-center">

            <p
              className="
                text-[9px]
                uppercase
                tracking-[0.2em]
                text-white/30
              "
            >
              Meaningfulness Score
            </p>


            <p
              className="
                mt-2
                text-6xl
                font-extralight
                tracking-[-0.05em]
                text-[#67B7FF]
                drop-shadow-[0_0_25px_rgba(103,183,255,0.4)]
              "
            >
              10
            </p>


            <div className="mt-4 flex justify-center">

              <span
                className="
                  rounded-full
                  border
                  border-[#67B7FF]/20
                  bg-[#67B7FF]/10
                  px-4
                  py-1.5
                  text-[9px]
                  uppercase
                  tracking-[0.18em]
                  text-[#67B7FF]
                "
              >
                Low Signal
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


/* ============================================
    CONTEXT BUILDER
============================================ */

function ContextBuilder() {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/[0.08]
        bg-[#0C1220]
        p-5
        shadow-[0_20px_60px_rgba(0,0,0,0.25)]
      "
    >

      <div className="flex items-center gap-2">

        <span className="h-1.5 w-1.5 rounded-full bg-[#4D7CFF]" />

        <p
          className="
            text-[9px]
            uppercase
            tracking-[0.18em]
            text-white/40
          "
        >
          Context Builder
        </p>

      </div>


      <p
        className="
          mt-5
          text-sm
          font-light
          leading-relaxed
          text-white/55
        "
      >
        Converts structured signals into AI-ready context.
      </p>


      <div className="mt-5 space-y-2">

        {[
          "Price movement",
          "Volume ratio",
          "News relevance",
          "Meaningfulness score"
        ].map((item) => (

          <div
            key={item}
            className="
              flex
              items-center
              gap-2
              text-[10px]
              text-white/35
            "
          >
            <span className="h-1 w-1 rounded-full bg-[#67B7FF]/70" />

            {item}

          </div>

        ))}

      </div>

    </div>
  );
}


/* ============================================
    AI MODEL
============================================ */

function AIModel() {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-xl
        border
        border-[#67B7FF]/15
        bg-gradient-to-br
        from-[#111C31]
        to-[#090E19]
        p-5
        shadow-[0_0_50px_rgba(34,91,230,0.1)]
      "
    >

      <div
        className="
          pointer-events-none
          absolute
          right-[-30px]
          top-[-30px]
          h-24
          w-24
          rounded-full
          bg-[#67B7FF]/20
          blur-[40px]
        "
      />


      <div className="relative">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <span
              className="
                h-2
                w-2
                animate-pulse
                rounded-full
                bg-[#67B7FF]
                shadow-[0_0_12px_#67B7FF]
              "
            />

            <p
              className="
                text-[9px]
                uppercase
                tracking-[0.18em]
                text-white/45
              "
            >
              AI Model
            </p>

          </div>


          <span className="text-[8px] text-white/25">
            QWEN
          </span>

        </div>


        <div
          className="
            mt-6
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            border
            border-[#67B7FF]/20
            bg-[#67B7FF]/10
          "
        >
          <span
            className="
              text-xl
              font-extralight
              text-[#8BCBFF]
            "
          >
            AI
          </span>

        </div>


        <p
          className="
            mt-5
            text-sm
            font-light
            leading-relaxed
            text-white/60
          "
        >
          Generates concise explanations from validated signals.
        </p>


        <div
          className="
            mt-5
            border-t
            border-white/[0.07]
            pt-4
          "
        >
          <p
            className="
              text-[8px]
              uppercase
              tracking-[0.16em]
              text-white/25
            "
          >
            Fallback enabled
          </p>

          <p className="mt-2 text-[10px] leading-relaxed text-white/35">
            Pulse continues with deterministic explanations if AI is unavailable.
          </p>

        </div>

      </div>

    </div>
  );
}


/* ============================================
    FINAL EXPLANATION
============================================ */

function ExplanationCard() {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-white/[0.1]
        bg-[#0D1423]
        p-6
        shadow-[0_30px_100px_rgba(0,0,0,0.4)]
      "
    >

      {/* BLUE OUTPUT GLOW */}

      <div
        className="
          pointer-events-none
          absolute
          right-[-40px]
          top-[-40px]
          h-40
          w-40
          rounded-full
          bg-[#225BE6]/20
          blur-[60px]
        "
      />


      <div className="relative">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <span
              className="
                h-2
                w-2
                animate-pulse
                rounded-full
                bg-[#8BCBFF]
                shadow-[0_0_15px_#8BCBFF]
              "
            />

            <p
              className="
                text-[9px]
                uppercase
                tracking-[0.2em]
                text-white/45
              "
            >
              Pulse Explanation
            </p>

          </div>


          <span
            className="
              rounded
              border
              border-white/[0.08]
              px-2
              py-1
              text-[8px]
              text-white/25
            "
          >
            OUTPUT
          </span>

        </div>


        <h3
          className="
            mt-8
            text-2xl
            font-light
            leading-snug
            tracking-[-0.02em]
            text-white
          "
        >
          NVIDIA moved up

          <span className="text-[#67B7FF]">
            {" "}0.84%.
          </span>

        </h3>


        <p
          className="
            mt-5
            text-sm
            font-light
            leading-relaxed
            text-white/45
          "
        >
          Trading volume remained close to its normal average,
          suggesting the movement was not accompanied by unusually
          high market participation.
        </p>


        {/* WHY IT MATTERS */}

        <div
          className="
            mt-7
            rounded-xl
            border
            border-[#67B7FF]/10
            bg-[#67B7FF]/[0.04]
            p-4
          "
        >
          <p
            className="
              text-[8px]
              uppercase
              tracking-[0.2em]
              text-[#67B7FF]/60
            "
          >
            Why it matters
          </p>


          <p
            className="
              mt-3
              text-sm
              font-light
              leading-relaxed
              text-white/60
            "
          >
            Recent company-related news was detected and included
            in the market context.
          </p>

        </div>


        {/* FOOTER */}

        <div
          className="
            mt-6
            flex
            items-center
            justify-between
            border-t
            border-white/[0.07]
            pt-5
          "
        >
          <p className="text-[9px] text-white/25">
            Generated from verified signals
          </p>


          <div className="flex items-center gap-2">

            <span className="h-1.5 w-1.5 rounded-full bg-[#67B7FF]" />

            <span className="text-[8px] uppercase tracking-[0.14em] text-[#67B7FF]/70">
              Ready
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}


export default AIIntelligence;