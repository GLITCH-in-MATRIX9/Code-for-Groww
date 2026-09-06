import {
  useEffect,
  useState
} from "react";

import { API_BASE_URL } from "../../config/apiBaseUrl";


interface DashboardResponse {

  aiBriefing: string;

  stocks: Array<{
    symbol: string;

    companyName: string;

    latestSnapshot: {

      meaningfulnessScore: number;

      severity: string;

      reasons: string[];

      newsHeadline: string | null;

    } | null;
  }>;

}


function PulseAIBriefing() {

  const [summary, setSummary] =
    useState<string>("");


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {

    async function fetchBriefing() {

      try {

        setLoading(true);

        setError(null);


        const response =
          await fetch(
            `${API_BASE_URL}/api/dashboard`
          );


        if (!response.ok) {

          throw new Error(
            "Failed to fetch dashboard data."
          );

        }


        const data: DashboardResponse =
          await response.json();


        /*
         * The briefing comes directly
         * from the backend.
         *
         * It is generated using only
         * the stocks currently returned
         * by the dashboard/watchlist.
         */

        setSummary(
          data.aiBriefing
        );

      } catch (error) {

        console.error(
          "Failed to load Pulse briefing:",
          error
        );


        setError(
          "Unable to load the latest market briefing."
        );

      } finally {

        setLoading(false);

      }

    }


    fetchBriefing();

  }, []);


  return (

    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/[0.025]
        p-6
      "
    >

      {/* HEADER */}

      <div
        className="
          flex
          items-center
          gap-2
        "
      >

        <span className="text-sm opacity-70">
          🧠
        </span>


        <p
          className="
            text-[10px]
            font-light
            uppercase
            tracking-[0.2em]
            text-white/45
          "
        >
          Pulse AI Briefing
        </p>

      </div>


      {/* LOADING */}

      {loading && (

        <div
          className="
            mt-4
            space-y-2
            animate-pulse
          "
        >

          <div
            className="
              h-3
              w-full
              rounded
              bg-white/10
            "
          />

          <div
            className="
              h-3
              w-5/6
              rounded
              bg-white/[0.06]
            "
          />

          <div
            className="
              h-3
              w-2/3
              rounded
              bg-white/[0.06]
            "
          />

        </div>

      )}


      {/* ERROR */}

      {!loading && error && (

        <p
          className="
            mt-3
            text-sm
            font-light
            text-white/40
          "
        >

          {error}

        </p>

      )}


      {/* BACKEND BRIEFING */}

      {!loading && !error && summary && (

        <p
          className="
            mt-3
            text-sm
            font-light
            leading-relaxed
            text-white/65
          "
        >

          {summary}

        </p>

      )}

    </div>

  );

}


export default PulseAIBriefing;