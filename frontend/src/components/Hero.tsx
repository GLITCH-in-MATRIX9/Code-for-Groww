import { Link } from "react-router-dom";

function Hero() {
  return (
    <section
      className="
        relative
        h-screen
        w-full
        overflow-hidden
        bg-[#050B18]
        text-white
      "
    >
      {/* ========================================
          BACKGROUND GRADIENTS
      ======================================== */}

      {/* Main deep blue atmosphere */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-br
          from-[#0A1633]
          via-[#050B18]
          to-[#071B42]
        "
      />

      {/* Soft blue glow — right */}

      <div
        className="
          pointer-events-none
          absolute
          -right-[15%]
          top-[-20%]
          h-[85%]
          w-[65%]
          rounded-full
          bg-[rgba(34,91,230,0.18)]
          blur-[140px]
        "
      />

      {/* Soft light-blue glow — center/right */}

      <div
        className="
          pointer-events-none
          absolute
          right-[15%]
          top-[35%]
          h-[35%]
          w-[35%]
          rounded-full
          bg-[rgba(80,180,255,0.10)]
          blur-[120px]
        "
      />

      {/* Very subtle indigo atmosphere — left */}

      <div
        className="
          pointer-events-none
          absolute
          -left-[20%]
          bottom-[-35%]
          h-[70%]
          w-[55%]
          rounded-full
          bg-[rgba(42,60,140,0.12)]
          blur-[140px]
        "
      />

      {/* ========================================
          NAVBAR
      ======================================== */}

      <nav
        className="
          relative
          z-20
          flex
          items-center
          justify-between
          px-8
          py-7
          md:px-14
          lg:px-20
        "
      >
        {/* LOGO */}

        <Link
          to="/"
          className="
            flex
            items-center
            gap-3
            text-sm
            font-light
            tracking-[0.16em]
            text-white/85
          "
        >
          {/* Logo mark */}
          <span
            className="
              flex
              h-7
              w-7
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

        {/* NAV LINKS */}

        {/* NAV LINKS */}

        <div
          className="
    hidden
    items-center
    gap-8
    text-xs
    font-light
    tracking-wide
    text-white/45
    lg:flex
  "
        >
          <a
            href="#idea"
            className="
      transition
      duration-300
      hover:text-blue-200
    "
          >
            The Idea
          </a>

          <a
            href="#architecture"
            className="
      transition
      duration-300
      hover:text-blue-200
    "
          >
            Architecture
          </a>

          <a
            href="#technology"
            className="
      transition
      duration-300
      hover:text-blue-200
    "
          >
            Technology
          </a>

          <a
            href="#ai"
            className="
      transition
      duration-300
      hover:text-blue-200
    "
          >
            Intelligence
          </a>

          <a
            href="#since-last-checked"
            className="
      transition
      duration-300
      hover:text-blue-200
    "
          >
            Changes
          </a>
        </div>

        {/* DASHBOARD BUTTON */}

        <Link
          to="/dashboard"
          className="
            rounded-md
            border
            border-blue-300/20
            bg-blue-400/10
            px-5
            py-2.5
            text-xs
            font-light
            text-blue-100
            backdrop-blur-md
            transition
            duration-300
            hover:border-blue-300/40
            hover:bg-blue-400/20
          "
        >
          Open Dashboard
        </Link>
      </nav>

      {/* ========================================
          HERO CONTENT
      ======================================== */}

      <div
        className="
          relative
          z-10
          flex
          h-[calc(100vh-85px)]
          items-center
          px-8
          pb-16
          md:px-14
          lg:px-20
        "
      >
        {/* LEFT CONTENT */}

        <div className="max-w-2xl">
          {/* SMALL LABEL */}

          <div
            className="
              mb-8
              flex
              items-center
              gap-3
            "
          >
            <span
              className="
                h-px
                w-8
                bg-blue-300/50
              "
            />

            <p
              className="
                text-[10px]
                font-light
                uppercase
                tracking-[0.3em]
                text-blue-200/55
              "
            >
              Code, by Groww Challenge
            </p>
          </div>

          {/* HEADLINE */}

          <h1
            className="
              text-5xl
              font-light
              leading-[1.08]
              tracking-[-0.035em]
              text-white
              sm:text-6xl
              lg:text-[5.2rem]
            "
          >
            Your watchlist.
            <br />
            <span
              className="
                bg-gradient-to-r
                from-blue-100
                via-blue-300
                to-[#72B8FF]
                bg-clip-text
                text-transparent
              "
            >
              With context.
            </span>
          </h1>

          {/* DESCRIPTION */}

          <p
            className="
              mt-9
              max-w-lg
              text-base
              font-light
              leading-relaxed
              text-white/50
              md:text-lg
            "
          >
            Pulse connects market movement, company news and AI to help you
            understand what changed in your portfolio — and more importantly,
            what actually matters.
          </p>

          {/* CTA */}

          <div
            className="
              mt-10
              flex
              items-center
              gap-5
            "
          >
            <Link
              to="/dashboard"
              className="
                inline-flex
                items-center
                gap-3
                rounded-md
                bg-gradient-to-r
                from-[rgb(34,91,230)]
                to-[#3B82F6]
                px-6
                py-3.5
                text-sm
                font-light
                text-white
                shadow-[0_10px_40px_rgba(34,91,230,0.28)]
                transition
                duration-300
                hover:scale-[1.02]
                hover:shadow-[0_15px_50px_rgba(34,91,230,0.38)]
              "
            >
              Explore Pulse
              <span className="text-base">→</span>
            </Link>

            <a
              href="#idea"
              className="
                text-sm
                font-light
                text-white/40
                transition
                duration-300
                hover:text-blue-200
              "
            >
              How it works
            </a>
          </div>

          {/* BOTTOM INSIGHT */}

          <div
            className="
              mt-14
              flex
              items-center
              gap-8
            "
          >
            {/* Insight 1 */}

            <div>
              <p
                className="
                  text-xs
                  font-light
                  text-blue-200/80
                "
              >
                Meaningful
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  font-light
                  text-white/35
                "
              >
                Insights
              </p>
            </div>

            <div className="h-8 w-px bg-white/10" />

            {/* Insight 2 */}

            <div>
              <p
                className="
                  text-xs
                  font-light
                  text-blue-200/80
                "
              >
                AI-powered
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  font-light
                  text-white/35
                "
              >
                Explanations
              </p>
            </div>

            <div className="h-8 w-px bg-white/10" />

            {/* Insight 3 */}

            <div>
              <p
                className="
                  text-xs
                  font-light
                  text-blue-200/80
                "
              >
                Real-time
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  font-light
                  text-white/35
                "
              >
                Context
              </p>
            </div>
          </div>
        </div>

        {/* ========================================
            RIGHT IMAGE AREA

            ADD YOUR IMAGE HERE
        ======================================== */}

        <div
          className="
    pointer-events-none
    absolute
    right-[3%]
    top-1/2
    hidden
    h-[85%]
    w-[50%]
    -translate-y-1/2
    lg:block
  "
        >
          {/* Ambient glow behind image */}
          <div
            className="
      absolute
      inset-[5%]
      rounded-full
      bg-blue-500/10
      blur-[100px]
    "
          />

          {/* Hero Image */}
          <img
            src="/heroimage.png"
            alt="Pulse market intelligence"
            className="
      absolute
      z-10
      right-[-3%]
      top-1/2
      h-[135%]
      w-auto
      max-w-none
      -translate-y-1/2
      object-contain
    "
          />
        </div>
      </div>

      {/* ========================================
          BOTTOM TAGLINE
      ======================================== */}

      <div
        className="
          absolute
          bottom-8
          left-8
          z-10
          md:left-14
          lg:left-20
        "
      >
        <p
          className="
            text-[10px]
            font-light
            tracking-[0.08em]
            text-white/25
          "
        >
          NOT JUST WHAT CHANGED. UNDERSTAND WHY IT MATTERS.
        </p>
      </div>

      {/* BOTTOM BORDER */}

      <div
        className="
          absolute
          bottom-0
          left-0
          h-px
          w-full
          bg-gradient-to-r
          from-transparent
          via-blue-300/20
          to-transparent
        "
      />
    </section>
  );
}

export default Hero;
