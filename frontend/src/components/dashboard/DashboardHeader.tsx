import { Link } from "react-router-dom";

function DashboardHeader() {
  return (
    <header
      className="
        fixed
        left-0
        right-0
        top-0
        z-50
        flex
        h-20
        items-center
        justify-between
        border-b
        border-white/[0.07]
        bg-[#030B1B]/80
        px-6
        backdrop-blur-xl
        md:px-10
        lg:px-14
      "
    >
      {/* LEFT */}

      <Link to="/">

        <div>

          <p
            className="
              text-[10px]
              font-light
              uppercase
              tracking-[0.22em]
              text-blue-300/50
            "
          >
            Market Intelligence
          </p>

          <p
            className="
              mt-1
              text-sm
              font-light
              text-white/70
            "
          >
            Your Pulse dashboard
          </p>

        </div>

      </Link>


      {/* RIGHT */}

      <div className="flex items-center gap-4">

        {/* STATUS */}

        <div
          className="
            hidden
            items-center
            gap-2
            text-xs
            font-light
            text-white/35
            sm:flex
          "
        >
          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-blue-400
              shadow-[0_0_10px_rgba(96,165,250,0.8)]
            "
          />

          Live
        </div>


        {/* PROFILE */}

        <div
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-white/10
            bg-white/[0.04]
            text-xs
            font-light
            text-white/60
          "
        >
          P
        </div>

      </div>

    </header>
  );
}

export default DashboardHeader;