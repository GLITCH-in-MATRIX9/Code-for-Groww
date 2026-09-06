interface MoverStock {
  symbol: string;
  changePercent: number;
}

interface MeaningfulStock {
  symbol: string;
  score: number;
}

interface TopMoversProps {
  biggestGainer: MoverStock | null;
  biggestLoser: MoverStock | null;
  mostMeaningful: MeaningfulStock | null;
}

function TopMovers({
  biggestGainer,
  biggestLoser,
  mostMeaningful,
}: TopMoversProps) {
  const sameStock =
    biggestGainer !== null &&
    mostMeaningful !== null &&
    biggestGainer.symbol === mostMeaningful.symbol;

  return (
    <div
      className="
        rounded-2xl
        border
        border-white/[0.06]
        bg-white/[0.02]
        p-6
      "
    >
      {/* TITLE */}

      <p
        className="
          text-[10px]
          font-light
          uppercase
          tracking-[0.2em]
          text-white/35
        "
      >
        Biggest Movers
      </p>

      {/* CARDS */}

      <div
        className="
          mt-4
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-3
        "
      >
        {/* TOP GAINER */}

        <div
          className="
            rounded-xl
            border
            border-white/[0.08]
            bg-white/[0.02]
            p-4
          "
        >
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.15em]
              text-white/40
            "
          >
            ↑ Top Gainer
          </p>

          {biggestGainer ? (
            <>
              <p className="mt-2 text-lg font-light text-white">
                {biggestGainer.symbol}
              </p>

              <p className="mt-1 text-sm text-white/65">
                +{biggestGainer.changePercent.toFixed(2)}%
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-lg font-light text-white/35">
                —
              </p>

              <p className="mt-1 text-sm text-white/30">
                No gainers
              </p>
            </>
          )}
        </div>

        {/* TOP LOSER */}

        <div
          className="
            rounded-xl
            border
            border-white/[0.08]
            bg-white/[0.02]
            p-4
          "
        >
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.15em]
              text-white/40
            "
          >
            ↓ Top Loser
          </p>

          {biggestLoser ? (
            <>
              <p className="mt-2 text-lg font-light text-white">
                {biggestLoser.symbol}
              </p>

              <p className="mt-1 text-sm text-white/65">
                {biggestLoser.changePercent.toFixed(2)}%
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-lg font-light text-white/35">
                —
              </p>

              <p className="mt-1 text-sm text-white/30">
                No losers
              </p>
            </>
          )}
        </div>

        {/* MOST MEANINGFUL */}

        <div
          className="
            rounded-xl
            border
            border-white/[0.08]
            bg-white/[0.02]
            p-4
          "
        >
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.15em]
              text-white/40
            "
          >
            Most Meaningful
          </p>

          {mostMeaningful ? (
            <>
              <p className="mt-2 text-lg font-light text-white">
                {mostMeaningful.symbol}
              </p>

              <p className="mt-1 text-sm text-white/65">
                Score {mostMeaningful.score}
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-lg font-light text-white/35">
                —
              </p>

              <p className="mt-1 text-sm text-white/30">
                No data available
              </p>
            </>
          )}
        </div>
      </div>

      {/* EXPLANATION */}

      <p
        className="
          mt-4
          text-[11px]
          font-light
          leading-relaxed
          text-white/30
        "
      >
        {sameStock
          ? "The biggest price mover is also the most meaningful stock based on Pulse's market signals."
          : "Price movement and meaningfulness are evaluated separately. Pulse prioritizes significance, not just movement size."}
      </p>
    </div>
  );
}

export default TopMovers;