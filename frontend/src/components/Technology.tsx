import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";

function Technology() {
  const technologies = [
    {
      number: "01",
      name: "React + TypeScript",
      category: "Frontend",
      description:
        "A responsive and type-safe interface for turning complex market data into clear, understandable experiences.",
    },
    {
      number: "02",
      name: "Tailwind CSS",
      category: "Design System",
      description:
        "A utility-first system that keeps the interface consistent while allowing precise control over every visual detail.",
    },
    {
      number: "03",
      name: "Node.js + Express",
      category: "API Layer",
      description:
        "A lightweight backend designed to orchestrate market data, intelligence services, AI explanations, and user requests.",
    },
    {
      number: "04",
      name: "Neon PostgreSQL",
      category: "Persistent Memory",
      description:
        "Pulse needs memory. Historical snapshots allow the system to understand what changed since the user last checked.",
    },
    {
      number: "05",
      name: "Yahoo Finance + Finnhub",
      category: "Market Signals",
      description:
        "Multiple data sources combine market movement with company-related news to create richer context around every stock.",
    },
    {
      number: "06",
      name: "Qwen + Ollama",
      category: "AI Intelligence",
      description:
        "AI transforms structured market signals into simple explanations while deterministic fallbacks keep the system reliable.",
    },
  ];

  // Section-wide scroll progress, used for a single restrained
  // parallax move on the sticky left panel — not per-card motion.
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const glowOneY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const glowTwoY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const leftContentY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  // Shared, quiet easing — the one "signature" motion curve for this section.
  const ease = [0.16, 1, 0.3, 1];

  return (
    <section
      id="technology"
      ref={sectionRef}
      className="
        relative
        w-full
        bg-[#F6F8FC]
        text-[#08152F]
      "
    >
      {/* ========================================
          SECTION HEADER — MOBILE ONLY
      ======================================== */}

      <div
        className="
          px-6
          pt-20
          md:px-12
          lg:hidden
        "
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.7, ease }}
          className="mb-10 flex items-center gap-4"
        >
          <div className="h-px w-10 bg-[#225BE6]" />

          <p
            className="
              text-[10px]
              font-light
              uppercase
              tracking-[0.3em]
              text-[#225BE6]/70
            "
          >
            Engineering Decisions
          </p>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, ease, delay: 0.05 }}
          className="
            text-5xl
            font-light
            leading-[1.08]
            tracking-[-0.04em]
          "
        >
          Built with
          <br />
          <span className="text-[#08152F]/30">intention.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
          className="
            mt-8
            max-w-md
            text-base
            font-light
            leading-relaxed
            text-[#08152F]/55
          "
        >
          Every layer of Pulse exists for a reason.
          The technology is infrastructure that allows meaningful
          context to exist.
        </motion.p>
      </div>

      {/* ========================================
          DESKTOP + MOBILE CONTENT
      ======================================== */}

      <div
        className="
          grid
          lg:grid-cols-[42%_58%]
        "
      >
        {/* ========================================
            LEFT SIDE — STICKY / PARALLAX EFFECT
        ======================================== */}

        <aside
          className="
            relative
            hidden
            lg:block
          "
        >
          <div
            className="
              sticky
              top-0
              flex
              h-screen
              items-center
              overflow-hidden
              border-r
              border-[#08152F]/10
              bg-[#F6F8FC]
              px-20
            "
          >
            {/* BLUE ATMOSPHERIC GLOW — drifts slowly with scroll */}

            <motion.div
              style={{ y: glowOneY }}
              className="
                pointer-events-none
                absolute
                -left-32
                top-[20%]
                h-[420px]
                w-[420px]
                rounded-full
                bg-[#225BE6]/10
                blur-[130px]
              "
            />

            <motion.div
              style={{ y: glowTwoY }}
              className="
                pointer-events-none
                absolute
                bottom-[-150px]
                right-[-100px]
                h-[350px]
                w-[350px]
                rounded-full
                bg-[#67B7FF]/10
                blur-[120px]
              "
            />

            {/* CONTENT — one quiet parallax drift, tied to the same scroll */}

            <motion.div style={{ y: leftContentY }} className="relative z-10">
              {/* LABEL */}

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease }}
                className="
                  mb-10
                  flex
                  items-center
                  gap-4
                "
              >
                <div className="h-px w-10 bg-[#225BE6]" />

                <p
                  className="
                    text-[10px]
                    font-light
                    uppercase
                    tracking-[0.3em]
                    text-[#225BE6]/70
                  "
                >
                  Engineering Decisions
                </p>
              </motion.div>

              {/* HEADING */}

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.85, ease, delay: 0.08 }}
                className="
                  max-w-md
                  text-6xl
                  font-light
                  leading-[1.08]
                  tracking-[-0.045em]
                  text-[#08152F]
                  xl:text-7xl
                "
              >
                Built with
                <br />
                <span className="text-[#08152F]/30">intention.</span>
              </motion.h2>

              {/* DESCRIPTION */}

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.85, ease, delay: 0.16 }}
                className="
                  mt-10
                  max-w-md
                  text-lg
                  font-light
                  leading-relaxed
                  text-[#08152F]/55
                "
              >
                Every layer of Pulse exists for a reason.
                <br />
                <br />
                The technology is not the product. It is the
                infrastructure that allows meaningful context to exist.
              </motion.p>

              {/* PRINCIPLE */}

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease, delay: 0.3 }}
                className="
                  mt-14
                  border-l-2
                  border-[#225BE6]
                  pl-6
                "
              >
                <p
                  className="
                    text-sm
                    font-light
                    leading-relaxed
                    text-[#08152F]/70
                  "
                >
                  Raw market data tells you
                  <span className="text-[#225BE6]"> what happened.</span>
                </p>

                <p
                  className="
                    mt-2
                    text-sm
                    font-light
                    text-[#08152F]/40
                  "
                >
                  Pulse is built to explain why it matters.
                </p>
              </motion.div>

              {/* SYSTEM METADATA */}

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease, delay: 0.4 }}
                className="
                  mt-16
                  flex
                  gap-12
                  border-t
                  border-[#08152F]/10
                  pt-7
                "
              >
                <div>
                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.2em]
                      text-[#08152F]/35
                    "
                  >
                    Stack
                  </p>

                  <p className="mt-2 text-sm font-light text-[#08152F]/70">
                    Full Stack
                  </p>
                </div>

                <div>
                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.2em]
                      text-[#08152F]/35
                    "
                  >
                    Focus
                  </p>

                  <p className="mt-2 text-sm font-light text-[#08152F]/70">
                    Intelligence
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </aside>

        {/* ========================================
            RIGHT SIDE — NORMAL PAGE SCROLL
        ======================================== */}

        <div
          className="
            bg-white
            px-6
            py-16
            md:px-12
            lg:min-h-[180vh]
            lg:px-20
            lg:py-24
          "
        >
          {/* RIGHT INTRO */}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, ease }}
            className="
              mb-16
              max-w-xl
              lg:mb-24
            "
          >
            <p
              className="
                text-[10px]
                font-light
                uppercase
                tracking-[0.28em]
                text-[#08152F]/35
              "
            >
              The Pulse Stack
            </p>

            <p
              className="
                mt-5
                text-lg
                font-light
                leading-relaxed
                text-[#08152F]/55
              "
            >
              Each engineering decision supports a different part
              of the intelligence system.
            </p>
          </motion.div>

          {/* TECHNOLOGY LIST — a single orchestrated, staggered reveal */}

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-15% 0px" }}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.12,
                },
              },
            }}
            className="border-t border-[#08152F]/10"
          >
            {technologies.map((technology) => (
              <motion.article
                key={technology.number}
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease },
                  },
                }}
                whileHover="hover"
                className="
                  group
                  relative
                  grid
                  gap-7
                  border-b
                  border-[#08152F]/10
                  py-12
                  transition
                  duration-500
                  md:grid-cols-[70px_1fr]
                  lg:py-16
                "
              >
                {/* NUMBER */}

                <div>
                  <span
                    className="
                      text-xs
                      font-light
                      tracking-wider
                      text-[#225BE6]/70
                    "
                  >
                    {technology.number}
                  </span>
                </div>

                {/* CONTENT */}

                <div>
                  <div
                    className="
                      flex
                      flex-col
                      gap-5
                      sm:flex-row
                      sm:items-start
                      sm:justify-between
                    "
                  >
                    <h3
                      className="
                        text-3xl
                        font-light
                        tracking-[-0.03em]
                        text-[#08152F]
                        transition
                        duration-300
                        group-hover:text-[#225BE6]
                        lg:text-4xl
                      "
                    >
                      {technology.name}
                    </h3>

                    <span
                      className="
                        w-fit
                        shrink-0
                        border
                        border-[#225BE6]/15
                        bg-[#225BE6]/[0.04]
                        px-3
                        py-1.5
                        text-[9px]
                        font-light
                        uppercase
                        tracking-[0.18em]
                        text-[#225BE6]/70
                      "
                    >
                      {technology.category}
                    </span>
                  </div>

                  <p
                    className="
                      mt-7
                      max-w-xl
                      text-base
                      font-light
                      leading-relaxed
                      text-[#08152F]/50
                    "
                  >
                    {technology.description}
                  </p>

                  {/* ACCENT LINE — grows on hover, driven by the shared curve */}

                  <motion.div
                    variants={{
                      hover: {
                        width: "100%",
                        transition: { duration: 0.7, ease },
                      },
                    }}
                    initial={{ width: "0%" }}
                    className="
                      mt-9
                      h-px
                      bg-gradient-to-r
                      from-[#225BE6]
                      via-[#67B7FF]
                      to-transparent
                    "
                  />
                </div>
              </motion.article>
            ))}
          </motion.div>

          {/* FINAL STATEMENT */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.9, ease }}
            className="
              mt-24
              border-t
              border-[#08152F]/10
              pt-14
              pb-10
            "
          >
            <div className="flex items-start gap-5">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: 0.3 }}
                className="
                  mt-3
                  h-2
                  w-2
                  shrink-0
                  rounded-full
                  bg-[#225BE6]
                  shadow-[0_0_18px_rgba(34,91,230,0.4)]
                "
              />

              <p
                className="
                  max-w-xl
                  text-2xl
                  font-light
                  leading-relaxed
                  tracking-[-0.02em]
                  text-[#08152F]/65
                  lg:text-3xl
                "
              >
                The architecture is designed around one principle:
                <span className="text-[#225BE6]">
                  {" "}
                  context should accumulate over time.
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Technology;