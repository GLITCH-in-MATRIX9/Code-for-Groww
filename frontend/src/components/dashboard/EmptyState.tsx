interface EmptyStateProps {
  stocksAnalyzed?: number;
}

function EmptyState({ stocksAnalyzed = 12 }: EmptyStateProps) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/[0.06]
        bg-white/[0.02]
        p-8
        text-center
      "
    >
      <p
        className="
          text-lg
          font-light
          text-white/80
        "
      >
        Nothing major changed
      </p>

      <p
        className="
          mx-auto
          mt-2
          max-w-sm
          text-sm
          font-light
          leading-relaxed
          text-white/35
        "
      >
        Your watchlist has been relatively stable since you last checked.
      </p>

      <div
        className="
          mx-auto
          mt-6
          flex
          max-w-sm
          flex-col
          gap-2
          text-left
          text-xs
          font-light
          text-white/50
        "
      >
        <p>✓ {stocksAnalyzed} stocks analyzed</p>
        <p>✓ No critical events detected</p>
        <p>✓ Market activity is normal</p>
      </div>

      <p
        className="
          mt-6
          text-[11px]
          font-light
          uppercase
          tracking-[0.15em]
          text-white/25
        "
      >
        Largest changes are still shown below
      </p>
    </div>
  );
}

export default EmptyState;