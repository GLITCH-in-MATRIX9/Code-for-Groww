interface MeaningfulnessSignals {

  priceMovement: number;

  volumeAnomaly: number;

  volatility: number;

  relativePerformance: number;

  eventImpact: number;

  newsImpact: number;

  userRelevance: number;

}


interface MeaningfulnessBreakdownProps {

  signals: MeaningfulnessSignals | null;

  score?: number;

}


/*
 * Must match meaningfulnessEngine.ts exactly.
 * These are display weights only — the engine
 * is the source of truth for the actual score.
 * If the engine's weights change, update this
 * too, or better: have the backend send the
 * weights alongside the signals so this file
 * can never drift out of sync again.
 */

const WEIGHTS: Record<
  keyof MeaningfulnessSignals,
  number
> = {

  priceMovement: 0.25,

  volumeAnomaly: 0.20,

  volatility: 0.15,

  relativePerformance: 0.15,

  eventImpact: 0.10,

  newsImpact: 0.10,

  userRelevance: 0.05,

};


const LABELS: Record<
  keyof MeaningfulnessSignals,
  string
> = {

  priceMovement: "Price Movement",

  volumeAnomaly: "Volume Anomaly",

  volatility: "Volatility",

  relativePerformance: "Relative Performance",

  eventImpact: "Event Impact",

  newsImpact: "News Impact",

  userRelevance: "User Relevance",

};


const SIGNAL_ORDER: (keyof MeaningfulnessSignals)[] = [

  "priceMovement",

  "volumeAnomaly",

  "volatility",

  "relativePerformance",

  "eventImpact",

  "newsImpact",

  "userRelevance",

];


function MeaningfulnessBreakdown({
  signals,
  score = 0,
}: MeaningfulnessBreakdownProps) {


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

      <div
        className="
          flex
          items-center
          justify-between
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
            Meaningfulness Engine
          </p>

          <p
            className="
              mt-1
              text-[11px]
              font-light
              text-white/35
            "
          >
            Signal contribution breakdown
          </p>

        </div>

        <div className="text-right">

          <p className="text-2xl font-light text-white">

            {score}

            <span className="text-sm text-white/30">
              {" "}
              / 100
            </span>

          </p>

        </div>

      </div>


      {/* NOT YET ANALYZED */}

      {!signals && (

        <div
          className="
            mt-6
            flex
            h-40
            items-center
            justify-center
            rounded-xl
            border
            border-white/[0.06]
          "
        >

          <p className="text-sm font-light text-white/40">

            No signal data yet for this stock.

          </p>

        </div>

      )}


      {/* SIGNAL BREAKDOWN */}

      {signals && (

        <div className="mt-6 space-y-4">

          {SIGNAL_ORDER.map((key) => {

            const value = signals[key];

            const contribution = Math.round(
              value * WEIGHTS[key]
            );

            return (

              <div key={key}>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    text-[11px]
                    font-light
                  "
                >

                  <span className="text-white/55">

                    {LABELS[key]}

                  </span>

                  <span className="text-white/40">

                    +{contribution} points

                  </span>

                </div>

                <div
                  className="
                    mt-2
                    h-1.5
                    w-full
                    overflow-hidden
                    rounded-full
                    bg-white/[0.06]
                  "
                >

                  <div
                    className="
                      h-full
                      rounded-full
                      bg-white/50
                      transition-all
                      duration-500
                    "
                    style={{
                      width: `${value}%`,
                    }}
                  />

                </div>

              </div>

            );

          })}

        </div>

      )}


      {/* SCORE EXPLANATION */}

      <div
        className="
          mt-6
          border-t
          border-white/[0.06]
          pt-4
        "
      >

        <p
          className="
            text-[11px]
            font-light
            leading-relaxed
            text-white/30
          "
        >
          Pulse combines deterministic market signals to
          determine how much attention a change deserves.
          This score does not predict whether a stock will
          rise or fall.
        </p>

      </div>

    </div>

  );

}


export default MeaningfulnessBreakdown;