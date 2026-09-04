/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pulse: {
          bg: "#060a14",
          card: "#0f1725",
          border: "#233552",
          blue: "#4aa8ff",
          cyan: "#54d7ff",
          violet: "#9d7bff",
          magenta: "#f15bb5"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(84, 215, 255, 0.25), 0 0 20px rgba(74, 168, 255, 0.12)"
      }
    }
  },
  plugins: []
};
