import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./styles/**/*.css"
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        parchment: "var(--parchment)",
        cream: "var(--cream)",
        wood: "var(--wood)",
        coffee: "var(--coffee)",
        sage: "var(--sage)",
        "warm-orange": "var(--warm-orange)",
        "brick-red": "var(--brick-red)",
        "wax-red": "var(--wax-red)",
        "old-blue-gray": "var(--old-blue-gray)",
        tape: "var(--tape)"
      },
      boxShadow: {
        paper: "0 16px 35px rgba(77, 49, 28, 0.26)",
        sticker: "0 8px 16px rgba(72, 45, 24, 0.18)",
        insetPaper: "inset 0 0 24px rgba(103, 69, 35, 0.12)"
      },
      fontFamily: {
        serif: [
          "var(--font-handbook-serif)",
          "STSong",
          "Songti SC",
          "Noto Serif CJK SC",
          "serif"
        ],
        sans: [
          "var(--font-handbook-sans)",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif"
        ]
      },
      borderRadius: {
        paper: "6px"
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translate(-50%, 4px)" },
          to: { opacity: "1", transform: "translate(-50%, 0)" }
        }
      },
      backgroundImage: {
        "paper-fibers":
          "radial-gradient(circle at 20% 15%, rgba(121, 82, 45, 0.10), transparent 22%), radial-gradient(circle at 85% 18%, rgba(202, 147, 75, 0.12), transparent 28%), linear-gradient(100deg, rgba(255,255,255,0.24), transparent 45%)",
        "wood-grain":
          "radial-gradient(ellipse at 35% 0%, rgba(255, 225, 174, 0.16), transparent 34%), linear-gradient(90deg, rgba(77, 42, 20, 0.18) 1px, transparent 1px), linear-gradient(15deg, #4b2b18, #8b5730 48%, #3a2115)"
      }
    }
  },
  plugins: []
};

export default config;
