import DashboardHeader from "../components/dashboard/DashboardHeader";

function Insights() {
  return (
    <div
      className="
        min-h-screen
        bg-[#030B1B]
        text-white
      "
    >
      <DashboardHeader />

      <main
        className="
          mt-20
          px-6
          py-10
          md:px-10
          lg:px-14
        "
      >
        <p
          className="
            text-[10px]
            font-light
            uppercase
            tracking-[0.2em]
            text-white/35
          "
        >
          Insights
        </p>

        <h1
          className="
            mt-2
            text-2xl
            font-light
            text-white/80
          "
        >
          Ranked insights across your whole watchlist
        </h1>

        <p
          className="
            mt-3
            max-w-lg
            text-sm
            font-light
            leading-relaxed
            text-white/35
          "
        >
          This page will bring together every meaningful insight Pulse has
          generated — sorted by score rather than alphabetically — separate
          from the day-to-day dashboard view.
        </p>
      </main>
    </div>
  );
}

export default Insights;