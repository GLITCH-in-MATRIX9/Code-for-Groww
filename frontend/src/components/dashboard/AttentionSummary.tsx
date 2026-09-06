import { useEffect, useState } from "react";

interface AttentionSummaryData {
  critical: number;
  high: number;
  notable: number;
  stable: number;
}

interface DashboardResponse {
  attentionSummary: AttentionSummaryData;
}

function AttentionSummary() {
  const [summary, setSummary] =
    useState<AttentionSummaryData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "http://localhost:3001/api/dashboard"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch dashboard data"
          );
        }

        const data: DashboardResponse =
          await response.json();

        setSummary(
          data.attentionSummary
        );

      } catch (error) {
        console.error(
          "Failed to load attention summary:",
          error
        );

        setError(
          "Unable to load attention summary"
        );

      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);


  const cards = [
    {
      icon: "🔥",
      count: summary?.critical ?? 0,
      label: "Critical Changes",
      helper: "Requires your attention",
    },
    {
      icon: "⚡",
      count: summary?.high ?? 0,
      label: "High Priority",
      helper: "Significant activity detected",
    },
    {
      icon: "👀",
      count: summary?.notable ?? 0,
      label: "Notable Changes",
      helper: "Worth reviewing",
    },
    {
      icon: "✓",
      count: summary?.stable ?? 0,
      label: "Stable",
      helper: "No significant change",
    },
  ];


  if (loading) {
    return (
      <div
        className="
          grid
          grid-cols-2
          gap-4
          lg:grid-cols-4
        "
      >
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="
              min-h-[130px]
              animate-pulse
              rounded-2xl
              border
              border-white/10
              bg-white/[0.025]
              p-5
            "
          >
            <div className="h-4 w-5 rounded bg-white/10" />

            <div className="mt-5 h-7 w-10 rounded bg-white/10" />

            <div className="mt-5 h-3 w-28 rounded bg-white/10" />

            <div className="mt-2 h-3 w-36 rounded bg-white/[0.05]" />
          </div>
        ))}
      </div>
    );
  }


  if (error) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-white/10
          bg-white/[0.025]
          p-5
          text-sm
          text-white/50
        "
      >
        {error}
      </div>
    );
  }


  return (
    <div
      className="
        grid
        grid-cols-2
        gap-4
        lg:grid-cols-4
      "
    >
      {cards.map((card) => (
        <div
          key={card.label}
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/[0.025]
            p-5
            transition
            duration-200
            hover:-translate-y-0.5
            hover:border-white/20
            hover:bg-white/[0.04]
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <span className="text-lg opacity-70">
              {card.icon}
            </span>

            <span
              className="
                text-2xl
                font-light
                text-white
              "
            >
              {card.count}
            </span>
          </div>

          <p
            className="
              mt-3
              text-xs
              font-medium
              text-white/80
            "
          >
            {card.label}
          </p>

          <p
            className="
              mt-1
              text-[11px]
              font-light
              text-white/35
            "
          >
            {card.helper}
          </p>
        </div>
      ))}
    </div>
  );
}

export default AttentionSummary;