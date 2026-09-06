interface DataFreshnessIndicatorProps {
  status?: "live" | "delayed";
  secondsAgo?: number;
}

function formatAge(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds ago`;

  const minutes = Math.floor(seconds / 60);

  return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
}

function DataFreshnessIndicator({
  status = "live",
  secondsAgo = 12,
}: DataFreshnessIndicatorProps) {
  const isLive = status === "live";

  return (
    <div
      className={`
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        px-3
        py-1.5
        text-[11px]
        font-light
        ${
          isLive
            ? "border-blue-400/20 bg-blue-500/[0.06] text-blue-200"
            : "border-amber-400/20 bg-amber-400/[0.06] text-amber-300"
        }
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${
            isLive
              ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"
              : "bg-amber-400"
          }
        `}
      />

      {isLive ? (
        <span>Live · Updated {formatAge(secondsAgo)}</span>
      ) : (
        <span>⚠ Data delayed · Last updated {formatAge(secondsAgo)}</span>
      )}
    </div>
  );
}

export default DataFreshnessIndicator;