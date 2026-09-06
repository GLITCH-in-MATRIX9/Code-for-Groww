import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer
      className="
        relative
        overflow-hidden
        bg-[#07152F]
        text-white
      "
    >
      {/* TOP BORDER */}

      <div className="h-px w-full bg-white/[0.08]" />

      {/* FOOTER CONTENT */}

      <div
        className="
          mx-auto
          max-w-7xl
          px-6
          py-10
          md:px-12
          lg:px-20
        "
      >
        <div
          className="
            flex
            flex-col
            gap-8
            md:flex-row
            md:items-center
            md:justify-between
          "
        >
          {/* BRAND */}

          <Link
            to="/"
            className="
              flex
              items-center
              gap-3
              w-fit
            "
          >
            {/* LOGO */}

            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-gradient-to-br
                from-[#225BE6]
                to-[#5AA8FF]
                shadow-lg
                shadow-blue-500/20
              "
            >
              <span className="text-[10px] text-white">
                ◆
              </span>
            </div>

            <span
              className="
                text-sm
                font-light
                tracking-[0.2em]
                text-white/80
              "
            >
              PULSE
            </span>
          </Link>


          {/* DESCRIPTION */}

          <p
            className="
              max-w-sm
              text-xs
              font-light
              leading-relaxed
              text-white/35
              md:text-center
            "
          >
            Understand what changed.
            <br />
            Focus on what matters.
          </p>


          {/* NAVIGATION */}

          <div
            className="
              flex
              items-center
              gap-7
              text-xs
              font-light
              text-white/45
            "
          >
            <Link
              to="/dashboard"
              className="
                transition
                duration-300
                hover:text-white
              "
            >
              Dashboard
            </Link>

            {/* Replace with your actual GitHub repository */}

            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="
                transition
                duration-300
                hover:text-white
              "
            >
              GitHub
            </a>
          </div>
        </div>


        {/* BOTTOM */}

        <div
          className="
            mt-10
            flex
            flex-col
            gap-3
            border-t
            border-white/[0.07]
            pt-6
            text-[10px]
            font-light
            text-white/75
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p>
            © {new Date().getFullYear()} Pulse
          </p>

          <p>
            Built for Code, by Groww Challenge
          </p>

           <p>
            Anjali Dass
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;