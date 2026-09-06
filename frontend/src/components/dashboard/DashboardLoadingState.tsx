import { useEffect, useState } from "react";

const PIPELINE_STEPS = [
  "Checking market changes...",
  "Analyzing trading activity...",
  "Detecting meaningful events...",
  "Gathering market context...",
];

interface DashboardLoadingStateProps {
  stepDurationMs?: number;
}

function DashboardLoadingState({
  stepDurationMs = 1400,
}: DashboardLoadingStateProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((current) => (current + 1) % PIPELINE_STEPS.length);
    }, stepDurationMs);

    return () => clearInterval(interval);
  }, [stepDurationMs]);

  return (
    <div
      className="
        flex
        min-h-[50vh]
        flex-col
        items-center
        justify-center
        gap-6
        text-center
      "
    >
      <div
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-full
          border
          border-blue-400/20
          bg-blue-500/[0.08]
          text-2xl
        "
      >
        🧠
      </div>

      <p
        className="
          text-sm
          font-light
          text-white/70
        "
      >
        Pulse is analyzing your watchlist
      </p>

      <div className="space-y-2">
        {PIPELINE_STEPS.map((step, index) => (
          <p
            key={step}
            className={`
              text-xs
              font-light
              transition
              duration-300
              ${
                index === stepIndex
                  ? "text-blue-300"
                  : index < stepIndex
                    ? "text-white/20 line-through"
                    : "text-white/20"
              }
            `}
          >
            {step}
          </p>
        ))}
      </div>
    </div>
  );
}

export default DashboardLoadingState;