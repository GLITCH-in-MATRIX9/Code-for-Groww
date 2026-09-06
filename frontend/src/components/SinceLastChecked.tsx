import { motion } from "framer-motion";

function SinceLastChecked() {
  // Same signature ease used across the site's motion system.
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section
      id="since-last-checked"
      className="
        relative
        min-h-screen
        w-full
        overflow-hidden
        bg-[#f7f8fc]
        px-6
        py-24
        md:px-12
        lg:px-20
      "
    >
      {/* ========================================
          BACKGROUND AMBIENT GLOW
      ======================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[42%]
          h-[500px]
          w-[700px]
          -translate-x-1/2
          rounded-full
          bg-blue-500/10
          blur-[140px]
        "
      />

      {/* ========================================
          BACKGROUND DECORATIVE CARDS
      ======================================== */}

      <div
        className="
          absolute
          left-[-5%]
          top-[32%]
          h-44
          w-[26%]
          rounded-2xl
          border
          border-[#dfe5f0]
          bg-white/30
        "
      />

      <div
        className="
          absolute
          right-[-4%]
          top-[32%]
          h-44
          w-[26%]
          rounded-2xl
          border
          border-[#dfe5f0]
          bg-white/30
        "
      />

      <div
        className="
          absolute
          bottom-[6%]
          left-[6%]
          h-48
          w-[28%]
          rounded-2xl
          border
          border-[#dfe5f0]
          bg-white/20
        "
      />

      <div
        className="
          absolute
          bottom-[6%]
          right-[6%]
          h-48
          w-[28%]
          rounded-2xl
          border
          border-[#dfe5f0]
          bg-white/20
        "
      />

      {/* ========================================
          SUBTLE CONNECTING LINES
      ======================================== */}

      <div
        className="
          absolute
          left-0
          top-[48%]
          h-px
          w-[30%]
          bg-gradient-to-r
          from-transparent
          via-[#8cb7ff]
          to-[#b8d0ff]
        "
      />

      <div
        className="
          absolute
          right-0
          top-[48%]
          h-px
          w-[30%]
          bg-gradient-to-l
          from-transparent
          via-[#8cb7ff]
          to-[#b8d0ff]
        "
      />

      <div
        className="
          absolute
          bottom-[18%]
          left-0
          h-px
          w-[20%]
          bg-[#d6e3f7]
        "
      />

      <div
        className="
          absolute
          bottom-[18%]
          right-0
          h-px
          w-[20%]
          bg-[#d6e3f7]
        "
      />

      {/* ========================================
          CONTENT
      ======================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          max-w-6xl
          flex-col
          items-center
        "
      >
        {/* SECTION LABEL */}

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.6, ease }}
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-blue-200
            bg-blue-50
            px-4
            py-2
          "
        >
          <span className="h-2 w-2 rounded-full bg-[#2563eb]" />

          <span
            className="
              text-[10px]
              font-medium
              uppercase
              tracking-[0.18em]
              text-[#2563eb]
            "
          >
            How Pulse Memory Works
          </span>
        </motion.div>

        {/* ========================================
            HEADING
        ======================================== */}

        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, ease, delay: 0.08 }}
          className="
            max-w-4xl
            text-center
            text-4xl
            font-light
            leading-[1.15]
            tracking-[-0.035em]
            text-[#182235]
            md:text-5xl
            lg:text-6xl
          "
        >
          Your watchlist remembers.
          <br />
          <span className="text-[#2563eb]">So you don't have to.</span>
        </motion.h2>

        {/* DESCRIPTION */}

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, ease, delay: 0.16 }}
          className="
            mt-6
            max-w-2xl
            text-center
            text-sm
            font-light
            leading-relaxed
            text-[#7b8494]
            md:text-base
          "
        >
          Pulse saves the state of your stocks and compares it
          with what is happening now<br /> giving you a clear picture
          of what changed since your last visit.
        </motion.p>

        {/* ========================================
            MAIN COMPARISON CARD
        ======================================== */}

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.9, ease, delay: 0.22 }}
          className="
            relative
            mt-16
            w-full
            max-w-3xl
          "
        >
          {/* BLUE GLOW */}

          <div
            className="
              pointer-events-none
              absolute
              -bottom-10
              left-1/2
              h-24
              w-[75%]
              -translate-x-1/2
              rounded-full
              bg-[#2563eb]/25
              blur-3xl
            "
          />

          {/* MAIN CARD — lifts gently on hover, the card's one signature interaction */}

          <motion.div
            whileHover={{
              y: -6,
              boxShadow: "0 35px 100px rgba(37,99,235,0.22)",
            }}
            transition={{ duration: 0.4, ease }}
            className="
              relative
              overflow-hidden
              rounded-2xl
              border
              border-[#d7dfec]
              bg-white
              shadow-[0_25px_80px_rgba(37,99,235,0.16)]
            "
          >
            {/* CARD HEADER */}

            <div
              className="
                flex
                items-start
                justify-between
                border-b
                border-[#e9edf4]
                px-7
                py-6
              "
            >
              <div>
                <p
                  className="
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[0.18em]
                    text-[#8b95a7]
                  "
                >
                  Since Last Checked
                </p>

                <h3
                  className="
                    mt-2
                    text-xl
                    font-light
                    tracking-[-0.02em]
                    text-[#1b2434]
                  "
                >
                  Here's what actually changed.
                </h3>
              </div>

              <motion.div
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.3, ease }}
                className="
                  rounded-full
                  bg-blue-50
                  px-4
                  py-2
                  text-xs
                  font-medium
                  text-[#2563eb]
                "
              >
                NVDA
              </motion.div>
            </div>

            {/* ========================================
                COMPARISON AREA
            ======================================== */}

            <div
              className="
                grid
                grid-cols-1
                gap-4
                p-7
                md:grid-cols-[1fr_auto_1fr]
                md:items-center
              "
            >
              {/* PREVIOUS */}

              <motion.div
                whileHover={{ y: -3, borderColor: "#c9d3e3" }}
                transition={{ duration: 0.3, ease }}
                className="
                  rounded-xl
                  border
                  border-[#e4e8ef]
                  bg-[#fafbfc]
                  p-5
                "
              >
                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.15em]
                    text-[#9aa3b1]
                  "
                >
                  Last Checked
                </p>

                <p
                  className="
                    mt-3
                    text-2xl
                    font-light
                    text-[#263143]
                  "
                >
                  $228.45
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    text-[#929bab]
                  "
                >
                  Previous market state
                </p>
              </motion.div>

              {/* TRANSITION */}

              <motion.div
                whileHover={{ scale: 1.12, x: 3 }}
                transition={{ duration: 0.35, ease }}
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-blue-200
                  bg-blue-50
                  text-lg
                  text-[#2563eb]
                "
              >
                →
              </motion.div>

              {/* CURRENT */}

              <motion.div
                whileHover={{ y: -3, scale: 1.015 }}
                transition={{ duration: 0.3, ease }}
                className="
                  rounded-xl
                  border
                  border-blue-200
                  bg-gradient-to-br
                  from-[#f7faff]
                  to-[#edf4ff]
                  p-5
                "
              >
                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.15em]
                    text-[#5b8ee8]
                  "
                >
                  Current State
                </p>

                <p
                  className="
                    mt-3
                    text-2xl
                    font-light
                    text-[#1f4fa3]
                  "
                >
                  $230.36
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    text-[#6680a6]
                  "
                >
                  Latest market analysis
                </p>
              </motion.div>
            </div>

            {/* ========================================
                CHANGE SUMMARY
            ======================================== */}

            <motion.div
              whileHover={{ borderColor: "#c3d7f5" }}
              transition={{ duration: 0.3, ease }}
              className="
                mx-7
                mb-7
                rounded-xl
                border
                border-[#dce6f7]
                bg-[#f5f9ff]
                p-5
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-4
                  md:flex-row
                  md:items-center
                  md:justify-between
                "
              >
                <div>
                  <p
                    className="
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.15em]
                      text-[#7296c9]
                    "
                  >
                    Pulse detected
                  </p>

                  <p
                    className="
                      mt-2
                      text-sm
                      font-light
                      leading-relaxed
                      text-[#35435a]
                    "
                  >
                    Recent company-related news was detected,
                    alongside meaningful movement in market activity.
                  </p>
                </div>

                {/* SCORE */}

                <div
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-3
                  "
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3, ease }}
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-full
                      bg-[#2563eb]
                      text-sm
                      font-medium
                      text-white
                      shadow-lg
                      shadow-blue-500/25
                    "
                  >
                    10
                  </motion.div>

                  <div>
                    <p className="text-xs text-[#667085]">
                      Meaningfulness
                    </p>

                    <p className="text-xs font-medium text-[#2563eb]">
                      Low severity
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CARD FOOTER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-t
                border-[#edf0f5]
                px-7
                py-4
              "
            >
              <p
                className="
                  text-xs
                  font-light
                  text-[#9aa3b1]
                "
              >
                Powered by historical snapshots
              </p>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  text-[#2563eb]
                "
              >
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-[#2563eb]"
                  animate={{ opacity: [1, 0.35, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                Updated now
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default SinceLastChecked;