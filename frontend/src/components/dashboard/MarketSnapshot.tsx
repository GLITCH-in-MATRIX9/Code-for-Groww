import {
  useEffect,
  useState
} from "react";

import { API_BASE_URL } from "../../config/apiBaseUrl";


interface MarketIndex {

  name: string;

  symbol: string;

  price: number;

  changePercent: number;

}


interface MarketSnapshotResponse {

  indices: MarketIndex[];

}


function MarketSnapshot() {

  const [
    indices,
    setIndices
  ] =
    useState<MarketIndex[]>([]);


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    error,
    setError
  ] =
    useState<string | null>(
      null
    );


  /*
   * ----------------------------------------
   * FETCH MARKET DATA
   * ----------------------------------------
   */

  useEffect(() => {

    async function fetchMarketSnapshot() {

      try {

        setLoading(true);

        setError(null);


        const response =
          await fetch(
            `${API_BASE_URL}/api/market/snapshot`
          );


        if (!response.ok) {

          throw new Error(
            "Failed to fetch market snapshot."
          );

        }


        const data:
          MarketSnapshotResponse =
            await response.json();


        setIndices(
          data.indices ?? []
        );

      } catch (error) {

        console.error(
          "Market snapshot error:",
          error
        );


        setError(
          "Market data is currently unavailable."
        );

      } finally {

        setLoading(false);

      }

    }


    fetchMarketSnapshot();

  }, []);


  /*
   * ----------------------------------------
   * RENDER
   * ----------------------------------------
   */

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
        Market Snapshot
      </p>


      {/* LOADING STATE */}

      {loading && (

        <div
          className="
            mt-4
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-3
          "
        >

          {[1, 2, 3].map(
            (item) => (

              <div
                key={item}
                className="
                  h-14
                  animate-pulse
                  rounded-xl
                  border
                  border-white/[0.05]
                  bg-white/[0.02]
                "
              />

            )
          )}

        </div>

      )}


      {/* ERROR STATE */}

      {!loading && error && (

        <div
          className="
            mt-4
            rounded-xl
            border
            border-white/[0.06]
            bg-white/[0.015]
            px-4
            py-3
          "
        >

          <p
            className="
              text-xs
              font-light
              text-white/40
            "
          >
            {error}
          </p>

        </div>

      )}


      {/* EMPTY STATE */}

      {!loading &&
        !error &&
        indices.length === 0 && (

          <div
            className="
              mt-4
              rounded-xl
              border
              border-white/[0.06]
              bg-white/[0.015]
              px-4
              py-3
            "
          >

            <p
              className="
                text-xs
                font-light
                text-white/40
              "
            >
              No market data available.
            </p>

          </div>

        )}


      {/* MARKET INDICES */}

      {!loading &&
        !error &&
        indices.length > 0 && (

          <div
            className="
              mt-4
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-3
            "
          >

            {indices.map(
              (index) => {

                const isPositive =
                  index.changePercent >= 0;


                return (

                  <div
                    key={index.symbol}
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      border
                      border-white/[0.05]
                      bg-white/[0.015]
                      px-4
                      py-3
                    "
                  >

                    <div>

                      <p
                        className="
                          text-xs
                          font-light
                          text-white/65
                        "
                      >
                        {index.name}
                      </p>


                      <p
                        className="
                          mt-1
                          text-[10px]
                          font-light
                          text-white/30
                        "
                      >
                        {index.price.toLocaleString(
                          "en-US",
                          {
                            maximumFractionDigits: 2
                          }
                        )}
                      </p>

                    </div>


                    <span
                      className={`
                        text-sm
                        font-medium
                        ${
                          isPositive
                            ? "text-white/70"
                            : "text-white/50"
                        }
                      `}
                    >

                      {isPositive
                        ? "+"
                        : ""}

                      {index.changePercent.toFixed(2)}%

                    </span>

                  </div>

                );

              }
            )}

          </div>

        )}


      {/* DESCRIPTION */}

      <p
        className="
          mt-4
          text-[11px]
          font-light
          leading-relaxed
          text-white/25
        "
      >
        Broader market movement helps Pulse determine whether
        a stock is moving independently or following general
        market activity.
      </p>

    </div>

  );

}


export default MarketSnapshot;