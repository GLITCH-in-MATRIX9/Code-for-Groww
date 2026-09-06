import { Link } from "react-router-dom";

interface WatchlistItem {
  id: number;
  symbol: string;
  companyName: string;
  createdAt: string;
}

interface DashboardSidebarProps {
  watchlist: WatchlistItem[];

  selectedSymbol: string | null;

  onSelectStock:
    (symbol: string) => void;

  loading: boolean;
}

function DashboardSidebar({
  watchlist,
  selectedSymbol,
  onSelectStock,
  loading
}: DashboardSidebarProps) {
  return (
    <aside
      className="
        hidden
        min-h-screen
        w-[260px]
        shrink-0
        border-r
        border-white/[0.07]
        bg-[#050B18]
        lg:flex
        lg:flex-col
      "
    >

      {/* LOGO */}

      <div
        className="
          flex
          h-20
          items-center
          border-b
          border-white/[0.07]
          px-7
        "
      >
        <Link
          to="/"
          className="
            flex
            items-center
            gap-3
            text-sm
            font-light
            tracking-[0.16em]
            text-white/90
          "
        >
          <span
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              border
              border-blue-300/20
              bg-blue-400/10
              text-xs
              text-blue-200
              shadow-[0_0_30px_rgba(34,91,230,0.25)]
            "
          >
            P
          </span>

          PULSE
        </Link>
      </div>


      {/* WORKSPACE */}

      <div className="px-4 py-7">

        <p
          className="
            mb-3
            px-3
            text-[10px]
            font-light
            uppercase
            tracking-[0.22em]
            text-white/25
          "
        >
          Workspace
        </p>


        <div
          className="
            flex
            items-center
            gap-3
            rounded-lg
            border
            border-blue-400/15
            bg-blue-400/[0.08]
            px-4
            py-3
            text-sm
            font-light
            text-blue-100
          "
        >
          <span className="text-blue-300">
            ◈
          </span>

          Overview
        </div>


        {/* GUIDE LINK */}

        <Link
          to="/guide"
          className="
            mt-2
            flex
            items-center
            gap-3
            rounded-lg
            px-4
            py-3
            text-sm
            font-light
            text-white/50
            transition
            duration-300
            hover:bg-white/[0.04]
            hover:text-white/80
          "
        >
          <span className="text-white/30">
            ?
          </span>

          How to use Pulse
        </Link>

      </div>


      {/* WATCHLIST */}

      <div
        className="
          flex-1
          overflow-y-auto
          px-4
        "
      >

        <div
          className="
            mb-4
            flex
            items-center
            justify-between
            px-3
          "
        >
          <p
            className="
              text-[10px]
              font-light
              uppercase
              tracking-[0.22em]
              text-white/25
            "
          >
            Watchlist
          </p>


          <span
            className="
              text-[10px]
              text-white/25
            "
          >
            {watchlist.length}
          </span>

        </div>


        {/* LOADING */}

        {loading && (

          <div
            className="
              px-3
              py-4
              text-xs
              font-light
              text-white/30
            "
          >
            Loading watchlist...
          </div>

        )}


        {/* EMPTY STATE */}

        {!loading &&
          watchlist.length === 0 && (

          <div
            className="
              px-3
              py-4
              text-xs
              font-light
              leading-relaxed
              text-white/30
            "
          >
            Your watchlist is empty.
          </div>

        )}


        {/* REAL WATCHLIST */}

        <div className="space-y-1">

          {watchlist.map((stock) => {

            const isSelected =
              selectedSymbol === stock.symbol;


            return (

              <button
                key={stock.id}
                onClick={() =>
                  onSelectStock(stock.symbol)
                }
                className={`
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-3
                  text-left
                  transition
                  duration-300

                  ${
                    isSelected
                      ? `
                        border
                        border-blue-400/15
                        bg-blue-400/[0.08]
                      `
                      : `
                        hover:bg-white/[0.04]
                      `
                  }
                `}
              >

                {/* STATUS DOT */}

                <span
                  className={`
                    h-2
                    w-2
                    shrink-0
                    rounded-full

                    ${
                      isSelected
                        ? `
                          bg-blue-400
                          shadow-[0_0_12px_rgba(96,165,250,0.8)]
                        `
                        : `
                          bg-white/15
                        `
                    }
                  `}
                />


                {/* STOCK INFO */}

                <div className="min-w-0">

                  <p
                    className={`
                      truncate
                      text-sm
                      font-light

                      ${
                        isSelected
                          ? "text-blue-100"
                          : "text-white/70"
                      }
                    `}
                  >
                    {stock.symbol}
                  </p>


                  <p
                    className="
                      mt-0.5
                      truncate
                      text-[10px]
                      text-white/30
                    "
                  >
                    {stock.companyName}
                  </p>

                </div>

              </button>

            );
          })}

        </div>

      </div>


      {/* BOTTOM */}

      <div
        className="
          border-t
          border-white/[0.07]
          p-5
        "
      >
        <Link
          to="/"
          className="
            flex
            items-center
            gap-3
            rounded-lg
            px-3
            py-3
            text-xs
            font-light
            text-white/35
            transition
            hover:bg-white/[0.04]
            hover:text-white/70
          "
        >
          ← Back to Pulse
        </Link>
      </div>

    </aside>
  );
}

export default DashboardSidebar;