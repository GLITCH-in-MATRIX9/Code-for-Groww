/* ========================================
   HOW TO USE PULSE — GUIDE PAGE
======================================== */

interface GuideSection {
  title: string;
  description: string;
  points: string[];
}

const whatPulseChecks: GuideSection[] = [
  {
    title: "Price Momentum",
    description:
      "Pulse tracks how much a stock's price has moved since you last checked, not just today's change.",
    points: [
      "A small move (under 0.5%) is treated as normal noise.",
      "Bigger moves raise the Meaningfulness Score and get called out.",
      "Direction matters too — sharp drops are flagged just as clearly as sharp gains.",
    ],
  },
  {
    title: "Trading Volume",
    description:
      "Volume tells you how many people are actually trading the stock right now compared to its recent average.",
    points: [
      "Above-average volume alongside a price move suggests real conviction behind it.",
      "A price move on low volume is often less reliable and may reverse.",
      "Unusual volume alone (even without a big price move) can be an early signal.",
    ],
  },
  {
    title: "Volatility Shifts",
    description:
      "Pulse compares recent price swings to the stock's longer-term pattern.",
    points: [
      "Rising volatility means bigger day-to-day price swings are likely ahead.",
      "Falling volatility suggests the stock is settling into a steadier range.",
    ],
  },
  {
    title: "News Signals",
    description:
      "Pulse pulls recent headlines and checks whether they're actually about this company.",
    points: [
      "A relevant headline is one added signal — not the whole story.",
      "No news found doesn't mean nothing is happening — check other signals too.",
    ],
  },
  {
    title: "Meaningfulness Score",
    description:
      "All of the above are combined into one score from 0–100, with a severity label.",
    points: [
      "Low / Medium: within normal day-to-day movement — no action typically needed.",
      "High / Critical: a real change worth understanding before you decide anything.",
    ],
  },
];

const howToUse: GuideSection[] = [
  {
    title: "Start with the Severity label",
    description:
      "Before reading anything else, glance at the severity tag. It tells you instantly how much attention this update deserves.",
    points: [
      "\"Low\" or \"Medium\" — you can skim and move on.",
      "\"High\" or \"Critical\" — worth 30 seconds of your attention.",
    ],
  },
  {
    title: "Read the \"Why Pulse noticed this\" reasons",
    description:
      "This is the model explaining its own reasoning in plain language — not just a number.",
    points: [
      "Each reason maps to one of the signals above (price, volume, volatility, or news).",
      "If multiple reasons point the same direction, that's a stronger signal than just one.",
    ],
  },
  {
    title: "Cross-check with News Signal",
    description:
      "A price or volume spike with a matching news headline is far more actionable than one without.",
    points: [
      "Move + relevant news = there's likely a real reason behind it.",
      "Move + no news = could be sector-wide movement, technical trading, or still-unreported news.",
    ],
  },
  {
    title: "Compare against your own reason for holding it",
    description:
      "Pulse tells you what changed — only you know why you're tracking this stock in the first place.",
    points: [
      "If the change contradicts your original thesis, that's worth revisiting.",
      "If it's unrelated to why you're holding it, it may not require any action at all.",
    ],
  },
  {
    title: "Use \"Since Last Checked\" to catch up quickly",
    description:
      "This section is built specifically so you don't have to reconstruct what happened since you were last here.",
    points: [
      "Changes are sorted by importance — the most significant one is always first.",
      "Empty list means genuinely nothing notable happened — you're fully caught up.",
    ],
  },
];

function GuideCard({ section }: { section: GuideSection }) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/[0.06]
        bg-white/[0.02]
        p-7
      "
    >
      <h3 className="text-lg font-light text-white/85">
        {section.title}
      </h3>

      <p className="mt-3 text-sm font-light leading-relaxed text-white/45">
        {section.description}
      </p>

      <ul className="mt-5 space-y-3">
        {section.points.map((point, index) => (
          <li
            key={index}
            className="flex items-start gap-3"
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
              {point}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GuidePage() {
  return (
    <section className="mx-auto max-w-5xl space-y-12">
      {/* ========================================
          PAGE INTRO
      ======================================== */}

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
          Guide
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
          How to use{" "}
          <span className="text-blue-300/80">Pulse</span>
        </h1>

        <p className="mt-6 max-w-2xl text-sm font-light leading-relaxed text-white/40 md:text-base">
          Pulse doesn't try to predict where a stock is going. It watches
          for changes that are worth your attention and explains, in plain
          language, why it flagged them — so you can decide what to do
          with that information.
        </p>
      </div>

      {/* ========================================
          WHAT PULSE CHECKS
      ======================================== */}

      <div>
        <div className="mb-6">
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.22em]
              text-white/30
            "
          >
            Under the hood
          </p>

          <h2 className="mt-2 text-2xl font-light text-white">
            What Pulse actually checks
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {whatPulseChecks.map((section) => (
            <GuideCard key={section.title} section={section} />
          ))}
        </div>
      </div>

      {/* ========================================
          HOW TO USE THE INFO
      ======================================== */}

      <div>
        <div className="mb-6">
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.22em]
              text-white/30
            "
          >
            Putting it to work
          </p>

          <h2 className="mt-2 text-2xl font-light text-white">
            How to actually use this information
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {howToUse.map((section) => (
            <GuideCard key={section.title} section={section} />
          ))}
        </div>
      </div>

      {/* ========================================
          DISCLAIMER
      ======================================== */}

      <div
        className="
          rounded-xl
          border
          border-white/[0.05]
          bg-white/[0.015]
          px-6
          py-5
        "
      >
        <p className="text-xs leading-relaxed text-white/30">
          Pulse surfaces patterns in price, volume, volatility and news —
          it does not predict future performance and is not financial
          advice. Always do your own research before making investment
          decisions.
        </p>
      </div>
    </section>
  );
}

export default GuidePage;