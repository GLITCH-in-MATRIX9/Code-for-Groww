import { motion, type Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

function Idea() {
  return (
    <section
      id="idea"
      className="
        w-full
        bg-white
        px-6
        py-24
        md:px-12
        md:py-32
        lg:px-20
      "
    >
      {/* ========================================
          HEADER
      ======================================== */}

      <motion.div
        className="mx-auto max-w-3xl text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={container}
      >

        <motion.p
          variants={fadeUp}
          className="
            text-[11px]
            font-light
            uppercase
            tracking-[0.28em]
            text-[#225BE6]/60
          "
        >
          The Idea
        </motion.p>


        <motion.h2
          variants={fadeUp}
          className="
            mt-6
            text-4xl
            font-light
            leading-[1.12]
            tracking-[-0.035em]
            text-[#101828]
            sm:text-5xl
            md:text-6xl
          "
        >
          A watchlist should tell you

          <br />

          <span className="text-[#225BE6]">
            what actually matters.
          </span>
        </motion.h2>


        <motion.p
          variants={fadeUp}
          className="
            mx-auto
            mt-7
            max-w-xl
            text-sm
            font-light
            leading-relaxed
            text-slate-500
            md:text-base
          "
        >
          Markets constantly generate prices, news and signals.
          Pulse connects that information to help you understand
          which movements deserve your attention.
        </motion.p>

      </motion.div>


      {/* ========================================
          FEATURE CARDS
      ======================================== */}

      <motion.div
        className="
          mx-auto
          mt-16
          grid
          max-w-6xl
          gap-5
          md:grid-cols-2
        "
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={container}
      >

        {/* ========================================
            CARD 01 — WHAT CHANGED
        ======================================== */}

        <motion.div
          variants={fadeUp}
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="
            group
            relative
            min-h-[430px]
            overflow-hidden
            rounded-2xl
            bg-gradient-to-br
            from-[#101F3D]
            via-[#0B1730]
            to-[#060D1C]
            p-8
            md:p-10
          "
        >

          {/* Blue glow */}

          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-[5%]
              h-[300px]
              w-[300px]
              -translate-x-1/2
              rounded-full
              bg-[#225BE6]/15
              blur-[100px]
            "
          />


          {/* ========================================
              VISUAL
          ======================================== */}

          <div
            className="
              relative
              flex
              h-[220px]
              items-center
              justify-center
            "
          >

            {/* Floating market card */}

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="
                w-[230px]
                rounded-2xl
                border
                border-white/10
                bg-white/[0.07]
                p-5
                shadow-2xl
                backdrop-blur-md
              "
            >

              <div className="flex items-center justify-between">

                <p
                  className="
                    text-[10px]
                    tracking-[0.16em]
                    text-white/40
                  "
                >
                  NVDA
                </p>


                <span
                  className="
                    rounded-full
                    bg-[#225BE6]/20
                    px-2.5
                    py-1
                    text-[9px]
                    text-blue-200
                  "
                >
                  LIVE
                </span>

              </div>


              <p
                className="
                  mt-5
                  text-3xl
                  font-light
                  tracking-tight
                  text-white
                "
              >
                +3.2%
              </p>


              <p
                className="
                  mt-1
                  text-[10px]
                  text-white/40
                "
              >
                NVIDIA Corporation
              </p>


              {/* Mini chart */}

              <div
                className="
                  relative
                  mt-5
                  h-12
                  overflow-hidden
                  rounded-lg
                  bg-black/20
                "
              >

                <svg
                  viewBox="0 0 200 50"
                  className="
                    absolute
                    inset-0
                    h-full
                    w-full
                  "
                >
                  <motion.path
                    d="
                      M0 38
                      C20 35 28 30 42 32
                      C60 35 65 15 82 20
                      C100 25 110 12 125 17
                      C145 23 150 8 170 12
                      C185 15 192 5 200 7
                    "
                    fill="none"
                    stroke="#67B7FF"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                  />
                </svg>

              </div>

            </motion.div>

          </div>


          {/* ========================================
              CONTENT
          ======================================== */}

          <div className="relative mt-10">

            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.25em]
                text-blue-300/50
              "
            >
              01 — Market Context
            </p>


            <h3
              className="
                mt-4
                text-2xl
                font-light
                tracking-tight
                text-white
              "
            >
              What changed?
            </h3>


            <p
              className="
                mt-4
                max-w-md
                text-sm
                font-light
                leading-relaxed
                text-white/50
              "
            >
              Pulse tracks price movement, trading volume,
              volatility and relevant company events.
            </p>



          </div>

        </motion.div>


        {/* ========================================
            CARD 02 — WHY IT MATTERS
        ======================================== */}

        <motion.div
          variants={fadeUp}
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="
            group
            relative
            min-h-[430px]
            overflow-hidden
            rounded-2xl
            bg-gradient-to-br
            from-[#225BE6]
            via-[#1749C4]
            to-[#0B2470]
            p-8
            md:p-10
          "
        >

          {/* Background circles */}

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="
              pointer-events-none
              absolute
              left-1/2
              top-[20px]
              h-[340px]
              w-[340px]
              -translate-x-1/2
              rounded-full
              border
              border-white/[0.08]
            "
          />

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="
              pointer-events-none
              absolute
              left-1/2
              top-[55px]
              h-[270px]
              w-[270px]
              -translate-x-1/2
              rounded-full
              border
              border-white/[0.10]
            "
          />


          {/* ========================================
              AI VISUAL
          ======================================== */}

          <div
            className="
              relative
              flex
              h-[220px]
              items-center
              justify-center
            "
          >

            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="
                flex
                h-32
                w-32
                items-center
                justify-center
                rounded-[2rem]
                border
                border-white/25
                bg-white/[0.10]
                backdrop-blur-md
                shadow-[0_20px_70px_rgba(0,0,0,0.25)]
              "
            >

              <div className="text-center">

                <p
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.25em]
                    text-white/50
                  "
                >
                  Pulse
                </p>

                <p
                  className="
                    mt-2
                    text-3xl
                    font-light
                    text-white
                  "
                >
                  AI
                </p>

              </div>

            </motion.div>

          </div>


          {/* ========================================
              CONTENT
          ======================================== */}

          <div className="relative mt-10">

            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.25em]
                text-blue-100/60
              "
            >
              02 — Intelligence
            </p>


            <h3
              className="
                mt-4
                text-2xl
                font-light
                tracking-tight
                text-white
              "
            >
              Why does it matter?
            </h3>


            <p
              className="
                mt-4
                max-w-md
                text-sm
                font-light
                leading-relaxed
                text-blue-100/70
              "
            >
              Pulse combines market signals with relevant news,
              calculates meaningfulness and explains the movement
              in simple language.
            </p>


          </div>

        </motion.div>

      </motion.div>


      {/* ========================================
          BOTTOM STATEMENT
      ======================================== */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="
          mx-auto
          mt-16
          max-w-6xl
          border-t
          border-slate-200
          pt-8
          text-center
        "
      >

        <p
          className="
            text-sm
            font-light
            text-slate-400
          "
        >
          Not just more market information.

          <span className="text-[#225BE6]">
            {" "}Better market understanding.
          </span>
        </p>

      </motion.div>

    </section>
  );
}

export default Idea;