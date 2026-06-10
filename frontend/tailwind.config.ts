import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        plum: { DEFAULT: "#1A0A0F", light: "#2D1520" },
        crimson: { DEFAULT: "#8B1A2F", light: "#A82040", muted: "#5C1120" },
        gold: { DEFAULT: "#C9956A", light: "#DDB48A", muted: "#8A6245" },
        parchment: { DEFAULT: "#F7F0E8", dark: "#E8DDD0" },
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        body: ["Inter", "sans-serif"],
      },
      keyframes: {
        "spin-slow": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
        "spin-slow-reverse": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(-360deg)" } },
        "fade-up": { "from": { opacity: "0", transform: "translateY(16px)" }, "to": { opacity: "1", transform: "translateY(0)" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      animation: {
        "spin-slow": "spin-slow 20s linear infinite",
        "spin-slow-reverse": "spin-slow-reverse 15s linear infinite",
        "fade-up": "fade-up 0.6s ease forwards",
        "fade-in": "fade-in 0.4s ease forwards",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
