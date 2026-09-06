interface AIUnavailableStateProps {
  deterministicExplanation?: string;
}

function AIUnavailableState({
  deterministicExplanation = "Price increased by 4.2% with trading volume 2.8× above average.",
}: AIUnavailableStateProps) {
  return (
    <div
      className="
        rounded-xl
        border
        border-amber-400/15
        bg-amber-400/[0.04]
        p-4
      "
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">⚠</span>

        <p
          className="
            text-xs
            font-medium
            text-amber-300/80
          "
        >
          AI explanation temporarily unavailable
        </p>
      </div>

      <p
        className="
          mt-2
          text-xs
          font-light
          leading-relaxed
          text-white/40
        "
      >
        Pulse is still analyzing your market data using deterministic
        signals.
      </p>

      <p
        className="
          mt-3
          rounded-lg
          border
          border-white/[0.06]
          bg-white/[0.02]
          px-3
          py-2.5
          text-xs
          font-light
          leading-relaxed
          text-white/60
        "
      >
        {deterministicExplanation}
      </p>
    </div>
  );
}

export default AIUnavailableState;