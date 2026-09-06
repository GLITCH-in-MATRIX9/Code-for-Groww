import {
  useEffect,
  useState
} from "react";

import { API_BASE_URL } from "../../config/apiBaseUrl";


interface StockSuggestion {
  symbol: string;
  companyName: string;
  exchange: string | null;
}


interface AddStockModalProps {
  isOpen: boolean;

  onClose: () => void;

  onStockAdded: (
    symbol: string
  ) => void;
}


function AddStockModal({
  isOpen,
  onClose,
  onStockAdded
}: AddStockModalProps) {


  /* ========================================
      STATE
  ======================================== */

  const [query, setQuery] =
    useState("");

  const [suggestions, setSuggestions] =
    useState<StockSuggestion[]>([]);

  const [selectedStock, setSelectedStock] =
    useState<StockSuggestion | null>(
      null
    );

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  /* ========================================
      RESET MODAL
  ======================================== */

  function resetModal() {

    setQuery("");

    setSuggestions([]);

    setSelectedStock(null);

    setSearchLoading(false);

    setLoading(false);

    setError(null);

  }


  /* ========================================
      LIVE STOCK SEARCH
  ======================================== */

  useEffect(() => {

    /*
     * Don't search when modal is closed.
     */

    if (!isOpen) {
      return;
    }


    /*
     * Don't search if user has already
     * selected a stock.
     */

    if (selectedStock) {
      return;
    }


    const normalizedQuery =
      query.trim();


    /*
     * Clear suggestions for empty input.
     */

    if (normalizedQuery.length === 0) {

      setSuggestions([]);

      setSearchLoading(false);

      return;

    }


    /*
     * Wait before calling API.
     *
     * This prevents a request for
     * every single keystroke.
     */

    const timeout =
      setTimeout(async () => {

        try {

          setSearchLoading(true);

          setError(null);


          const response =
            await fetch(
              `${API_BASE_URL}/api/stocks/search?q=${encodeURIComponent(
                normalizedQuery
              )}`
            );


          if (!response.ok) {

            throw new Error(
              "Unable to search stocks."
            );

          }


          const data =
            await response.json();


          setSuggestions(data);


        } catch (error) {

          console.error(
            "Stock search error:",
            error
          );


          /*
           * Don't show a big error for
           * search failures. Just clear
           * the suggestions.
           */

          setSuggestions([]);


        } finally {

          setSearchLoading(false);

        }

      }, 350);


    return () =>
      clearTimeout(timeout);


  }, [
    query,
    isOpen,
    selectedStock
  ]);


  /* ========================================
      SELECT STOCK
  ======================================== */

  function handleSelectStock(
    stock: StockSuggestion
  ) {

    setSelectedStock(stock);

    setQuery("");

    setSuggestions([]);

    setError(null);

  }


  /* ========================================
      CLEAR SELECTED STOCK
  ======================================== */

  function handleClearSelection() {

    setSelectedStock(null);

    setQuery("");

    setSuggestions([]);

  }


  /* ========================================
      SUBMIT
  ======================================== */

  async function handleSubmit(
    event: React.FormEvent
  ) {

    event.preventDefault();


    if (!selectedStock) {

      setError(
        "Please select a stock from the suggestions."
      );

      return;

    }


    try {

      setLoading(true);

      setError(null);


      const response =
        await fetch(
          `${API_BASE_URL}/api/watchlist`,
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              symbol:
                selectedStock.symbol,

              companyName:
                selectedStock.companyName

            })

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ??
          "Unable to add stock."
        );

      }


      /*
       * Tell Dashboard which stock
       * was added.
       */

      onStockAdded(
        data.symbol
      );


      resetModal();

      onClose();


    } catch (error) {

      console.error(
        "Add stock error:",
        error
      );


      setError(
        error instanceof Error
          ? error.message
          : "Unable to add stock."
      );


    } finally {

      setLoading(false);

    }

  }


  /* ========================================
      CLOSE
  ======================================== */

  function handleClose() {

    if (loading) {
      return;
    }

    resetModal();

    onClose();

  }


  /* ========================================
      DON'T RENDER WHEN CLOSED
  ======================================== */

  if (!isOpen) {
    return null;
  }


  return (

    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        px-5
      "
    >


      {/* ========================================
          BACKDROP
      ======================================== */}

      <div
        onClick={handleClose}

        className="
          absolute
          inset-0
          bg-[#020817]/85
          backdrop-blur-md
        "
      />


      {/* ========================================
          MODAL
      ======================================== */}

      <div
        className="
          relative
          w-full
          max-w-lg
          overflow-hidden
          rounded-2xl
          border
          border-white/[0.08]
          bg-[#07152F]
          shadow-[0_35px_120px_rgba(0,0,0,0.7)]
        "
      >


        {/* ========================================
            SUBTLE BLUE GLOW
        ======================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-64
            w-64
            rounded-full
            bg-blue-500/[0.10]
            blur-[90px]
          "
        />


        {/* ========================================
            HEADER
        ======================================== */}

        <div
          className="
            relative
            flex
            items-start
            justify-between
            border-b
            border-white/[0.06]
            px-7
            py-6
          "
        >

          <div>

            <p
              className="
                text-[10px]
                font-light
                uppercase
                tracking-[0.25em]
                text-blue-300/50
              "
            >
              Watchlist
            </p>


            <h2
              className="
                mt-2
                text-2xl
                font-light
                tracking-[-0.025em]
                text-white
              "
            >
              Add a stock
            </h2>


            <p
              className="
                mt-2
                text-sm
                font-light
                text-white/35
              "
            >
              Search for a company to start tracking it.
            </p>

          </div>


          {/* CLOSE */}

          <button
            type="button"

            onClick={handleClose}

            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              border
              border-white/[0.06]
              text-lg
              font-light
              text-white/40
              transition
              hover:bg-white/[0.06]
              hover:text-white
            "
          >
            ×
          </button>

        </div>


        {/* ========================================
            FORM
        ======================================== */}

        <form
          onSubmit={handleSubmit}

          className="
            relative
            px-7
            py-7
          "
        >


          {/* ========================================
              SEARCH INPUT
          ======================================== */}

          {!selectedStock && (

            <div>

              <label
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.18em]
                  text-white/35
                "
              >
                Search stocks
              </label>


              <div className="relative mt-3">


                {/* SEARCH ICON */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-sm
                    text-white/25
                  "
                >
                  ⌕
                </div>


                <input
                  type="text"

                  value={query}

                  onChange={(event) =>
                    setQuery(
                      event.target.value
                    )
                  }

                  placeholder="Search Apple, NVIDIA, AAPL..."

                  autoFocus

                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/[0.08]
                    bg-white/[0.03]
                    py-4
                    pl-11
                    pr-12
                    text-sm
                    font-light
                    text-white
                    outline-none
                    placeholder:text-white/20
                    transition
                    duration-200
                    focus:border-blue-400/40
                    focus:bg-blue-400/[0.03]
                    focus:ring-4
                    focus:ring-blue-400/[0.05]
                  "
                />


                {/* LOADING */}

                {searchLoading && (

                  <div
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                    "
                  >

                    <div
                      className="
                        h-4
                        w-4
                        animate-spin
                        rounded-full
                        border-2
                        border-blue-300/20
                        border-t-blue-300
                      "
                    />

                  </div>

                )}

              </div>


              {/* ========================================
                  SUGGESTIONS
              ======================================== */}

              {suggestions.length > 0 && (

                <div
                  className="
                    mt-3
                    overflow-hidden
                    rounded-xl
                    border
                    border-white/[0.07]
                    bg-[#050F24]
                  "
                >

                  {suggestions.map(
                    (stock) => (

                      <button
                        key={`${stock.symbol}-${stock.exchange}`}

                        type="button"

                        onClick={() =>
                          handleSelectStock(stock)
                        }

                        className="
                          group
                          flex
                          w-full
                          items-center
                          justify-between
                          gap-4
                          border-b
                          border-white/[0.05]
                          px-5
                          py-4
                          text-left
                          transition
                          duration-200
                          last:border-b-0
                          hover:bg-blue-500/[0.06]
                        "
                      >


                        {/* LEFT */}

                        <div
                          className="
                            flex
                            min-w-0
                            items-center
                            gap-4
                          "
                        >

                          {/* SYMBOL */}

                          <div
                            className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-blue-400/10
                              bg-blue-400/[0.06]
                              text-xs
                              font-light
                              text-blue-200
                            "
                          >
                            {stock.symbol
                              .slice(0, 4)}
                          </div>


                          {/* COMPANY */}

                          <div className="min-w-0">

                            <p
                              className="
                                text-sm
                                font-light
                                text-white/80
                                transition
                                group-hover:text-white
                              "
                            >
                              {stock.symbol}
                            </p>


                            <p
                              className="
                                mt-1
                                truncate
                                text-[11px]
                                font-light
                                text-white/30
                              "
                            >
                              {stock.companyName}
                            </p>

                          </div>

                        </div>


                        {/* EXCHANGE */}

                        {stock.exchange && (

                          <span
                            className="
                              shrink-0
                              text-[9px]
                              uppercase
                              tracking-wide
                              text-white/20
                            "
                          >
                            {stock.exchange}
                          </span>

                        )}

                      </button>

                    )
                  )}

                </div>

              )}


              {/* NO RESULTS */}

              {!searchLoading &&
                query.trim().length > 1 &&
                suggestions.length === 0 && (

                  <p
                    className="
                      mt-4
                      text-center
                      text-xs
                      font-light
                      text-white/25
                    "
                  >
                    No stocks found.
                  </p>

                )}

            </div>

          )}


          {/* ========================================
              SELECTED STOCK
          ======================================== */}

          {selectedStock && (

            <div>

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.18em]
                  text-white/35
                "
              >
                Selected stock
              </p>


              <div
                className="
                  mt-3
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-blue-400/20
                  bg-blue-500/[0.06]
                  p-5
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-4
                  "
                >

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-400/[0.12]
                      text-xs
                      text-blue-200
                    "
                  >
                    {selectedStock.symbol
                      .slice(0, 4)}
                  </div>


                  <div>

                    <p
                      className="
                        text-base
                        font-light
                        text-white
                      "
                    >
                      {selectedStock.symbol}
                    </p>


                    <p
                      className="
                        mt-1
                        text-xs
                        font-light
                        text-white/35
                      "
                    >
                      {selectedStock.companyName}
                    </p>

                  </div>

                </div>


                {/* CHANGE */}

                <button
                  type="button"

                  onClick={
                    handleClearSelection
                  }

                  className="
                    text-[10px]
                    uppercase
                    tracking-wide
                    text-blue-300/60
                    transition
                    hover:text-blue-200
                  "
                >
                  Change
                </button>

              </div>

            </div>

          )}


          {/* ========================================
              ERROR
          ======================================== */}

          {error && (

            <div
              className="
                mt-5
                rounded-xl
                border
                border-red-400/15
                bg-red-400/[0.05]
                px-4
                py-3
              "
            >

              <p
                className="
                  text-xs
                  font-light
                  text-red-200/80
                "
              >
                {error}
              </p>

            </div>

          )}


          {/* ========================================
              ACTIONS
          ======================================== */}

          <div
            className="
              mt-8
              flex
              items-center
              justify-end
              gap-3
            "
          >

            <button
              type="button"

              onClick={handleClose}

              disabled={loading}

              className="
                rounded-xl
                px-5
                py-3
                text-xs
                font-light
                text-white/40
                transition
                hover:text-white/70
                disabled:opacity-40
              "
            >
              Cancel
            </button>


            <button
              type="submit"

              disabled={
                loading ||
                !selectedStock
              }

              className="
                inline-flex
                min-w-[145px]
                items-center
                justify-center
                rounded-xl
                border
                border-blue-300/20
                bg-blue-500/90
                px-5
                py-3
                text-xs
                font-light
                text-white
                shadow-[0_10px_35px_rgba(59,130,246,0.18)]
                transition
                duration-200
                hover:bg-blue-400
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {loading
                ? "Adding..."
                : "Add to Watchlist"
              }
            </button>

          </div>

        </form>


        {/* FOOTNOTE */}

        <div
          className="
            relative
            border-t
            border-white/[0.05]
            px-7
            py-4
          "
        >

          <p
            className="
              text-[10px]
              font-light
              tracking-wide
              text-white/20
            "
          >
            Pulse tracks meaningful changes, not just market noise.
          </p>

        </div>

      </div>

    </div>

  );

}


export default AddStockModal;