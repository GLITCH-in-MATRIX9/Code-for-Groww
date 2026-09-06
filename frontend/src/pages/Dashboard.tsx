import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AddStockModal from "../components/dashboard/AddStockModal";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import PulseOverview from "../components/dashboard/PulseOverview";
import { API_BASE_URL } from "../config/apiBaseUrl";

interface WatchlistItem {
  id: number;
  symbol: string;
  companyName: string;
  createdAt: string;
}

function Dashboard() {
  /* ========================================
      STATE
  ======================================== */

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [isAddStockOpen, setIsAddStockOpen] = useState(false);

  /* ========================================
      LOAD WATCHLIST
  ======================================== */

  async function loadWatchlist() {
    try {
      setLoading(true);

      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/watchlist`);

      if (!response.ok) {
        throw new Error("Unable to fetch watchlist.");
      }

      const data = await response.json();

      setWatchlist(data);

      /*
        Automatically select the first stock
        when no stock is currently selected.
      */

      if (data.length > 0 && !selectedSymbol) {
        setSelectedSymbol(data[0].symbol);
      }
    } catch (error) {
      console.error("Watchlist error:", error);

      setError("Unable to load your watchlist.");
    } finally {
      setLoading(false);
    }
  }

  /* ========================================
      INITIAL LOAD
  ======================================== */

  useEffect(() => {
    loadWatchlist();
  }, []);

  /* ========================================
      REMOVE STOCK
  ======================================== */

  async function handleRemoveStock(symbol: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/watchlist/${symbol}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Unable to remove stock.");
      }

      const updatedWatchlist = watchlist.filter(
        (stock) => stock.symbol !== symbol,
      );

      setWatchlist(updatedWatchlist);

      /*
        If the removed stock was selected,
        select another stock automatically.
      */

      if (selectedSymbol === symbol) {
        if (updatedWatchlist.length > 0) {
          setSelectedSymbol(updatedWatchlist[0].symbol);
        } else {
          setSelectedSymbol(null);
        }
      }
    } catch (error) {
      console.error("Remove stock error:", error);
    }
  }

  /* ========================================
      PAGE
  ======================================== */

  return (
    <div
      className="
        min-h-screen
        bg-[#030B1B]
        text-white
      "
    >
      {/*
        DashboardHeader is now `fixed` (top-0, h-20, z-50) and sits
        outside normal document flow. The sidebar and main content
        below are offset by top-20 / mt-20 to match its 80px height.
      */}

      <DashboardHeader onAddStock={() => setIsAddStockOpen(true)} />

      {/* ========================================
          STATIC SIDEBAR

          Fixed below the fixed 80px header.
      ======================================== */}

      <aside
        className="
          fixed
          bottom-0
          left-0
          top-20
          z-40
          hidden
          w-[270px]
          border-r
          border-white/[0.06]
          bg-[#040D20]
          md:block
        "
      >
        <div
          className="
            h-full
            p-6
          "
        >
          {/* SIDEBAR TITLE */}

          <div
            className="
              mb-6
              flex
              items-center
              justify-between
            "
          >
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.22em]
                text-white/30
              "
            >
              Watchlist
            </p>

            <span
              className="
                flex
                h-6
                min-w-6
                items-center
                justify-center
                rounded-full
                bg-white/[0.05]
                px-2
                text-[10px]
                text-white/35
              "
            >
              {watchlist.length}
            </span>
          </div>

          {/* GUIDE LINK */}

          <Link
            to="/guide"
            className="
              mb-6
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-white/[0.06]
              px-4
              py-3
              text-xs
              font-light
              text-white/40
              transition
              duration-200
              hover:border-blue-400/20
              hover:bg-blue-500/[0.06]
              hover:text-blue-200
            "
          >
            <span className="text-sm text-blue-300/60">?</span>
            How to use Pulse
          </Link>

          {/* LOADING */}

          {loading && (
            <div
              className="
                py-10
                text-center
                text-xs
                font-light
                text-white/25
              "
            >
              Loading watchlist...
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div
              className="
                rounded-xl
                border
                border-red-400/10
                bg-red-400/[0.04]
                p-4
              "
            >
              <p
                className="
                  text-xs
                  font-light
                  text-red-200/70
                "
              >
                {error}
              </p>
            </div>
          )}

          {/* EMPTY WATCHLIST */}

          {!loading && !error && watchlist.length === 0 && (
            <div
              className="
                  rounded-xl
                  border
                  border-dashed
                  border-white/[0.08]
                  p-5
                "
            >
              <p
                className="
                    text-xs
                    font-light
                    leading-relaxed
                    text-white/30
                  "
              >
                Your watchlist is empty.
              </p>

              <button
                onClick={() => setIsAddStockOpen(true)}
                className="
                    mt-4
                    text-xs
                    text-blue-300/70
                    transition
                    hover:text-blue-200
                  "
              >
                Add your first stock →
              </button>
            </div>
          )}

          {/* ========================================
              WATCHLIST STOCKS
          ======================================== */}

          <div className="space-y-2">
            {watchlist.map((stock) => {
              const isSelected = selectedSymbol === stock.symbol;

              return (
                <div
                  key={stock.id}

                  className={`
                      group
                      relative
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      border
                      transition
                      duration-200

                      ${
                        isSelected
                          ? `
                            border-blue-400/20
                            bg-blue-500/[0.08]
                          `
                          : `
                            border-transparent
                            hover:border-white/[0.05]
                            hover:bg-white/[0.025]
                          `
                      }
                    `}
                >
                  {/* STOCK BUTTON */}

                  <button
                    onClick={() => setSelectedSymbol(stock.symbol)}

                    className="
                        flex
                        flex-1
                        items-center
                        gap-3
                        px-4
                        py-3.5
                        text-left
                      "
                  >
                    {/* SYMBOL ICON */}

                    <div
                      className={`
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          text-[10px]
                          font-light

                          ${
                            isSelected
                              ? `
                                bg-blue-400/15
                                text-blue-300
                              `
                              : `
                                bg-white/[0.04]
                                text-white/40
                              `
                          }
                        `}
                    >
                      {stock.symbol.slice(0, 2)}
                    </div>

                    {/* STOCK INFO */}

                    <div
                      className="
                          min-w-0
                          flex-1
                        "
                    >
                      <p
                        className={`
                            text-sm
                            font-light

                            ${isSelected ? "text-white" : "text-white/65"}
                          `}
                      >
                        {stock.symbol}
                      </p>

                      <p
                        className="
                            mt-1
                            truncate
                            text-[10px]
                            font-light
                            text-white/25
                          "
                      >
                        {stock.companyName}
                      </p>
                    </div>
                  </button>

                  {/* REMOVE BUTTON */}

                  <button
                    onClick={() => handleRemoveStock(stock.symbol)}

                    className="
                        mr-3
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-md
                        text-xs
                        text-white/20
                        opacity-0
                        transition
                        hover:bg-red-400/[0.08]
                        hover:text-red-300
                        group-hover:opacity-100
                      "

                    title="Remove stock"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* ADD STOCK SIDEBAR BUTTON */}

          {!loading && watchlist.length > 0 && (
            <button
              onClick={() => setIsAddStockOpen(true)}

              className="
                  mt-5
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-dashed
                  border-white/[0.08]
                  px-4
                  py-3.5
                  text-xs
                  font-light
                  text-white/35
                  transition
                  hover:border-blue-400/20
                  hover:bg-blue-500/[0.04]
                  hover:text-blue-200
                "
            >
              <span className="text-base">+</span>
              Add Stock
            </button>
          )}
        </div>
      </aside>

      {/* ========================================
          MAIN CONTENT

          mt-20 clears the fixed 80px header.
          On desktop, ml-[270px] creates space
          for the fixed sidebar.

          This is the ONLY area that moves
          when the page scrolls.
      ======================================== */}

      <main
        className="
          mt-20
          min-h-[calc(100vh-5rem)]
          px-6
          py-10
          md:ml-[270px]
          md:px-10
          lg:px-14
        "
      >
        <PulseOverview
          selectedSymbol={selectedSymbol}
          watchlist={watchlist}
          watchlistCount={watchlist.length}
        />
      </main>

      {/* ========================================
          ADD STOCK MODAL
      ======================================== */}

      <AddStockModal
        isOpen={isAddStockOpen}

        onClose={() => setIsAddStockOpen(false)}

        onStockAdded={async (symbol) => {
          await loadWatchlist();

          setSelectedSymbol(symbol);
        }}
      />
    </div>
  );
}

export default Dashboard;