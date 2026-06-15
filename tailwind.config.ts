import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        harbor: {
          navy: "#082033",
          deep: "#0E2B42",
          panel: "#123852",
          cyan: "#00A6C8",
          gold: "#C7932B",
          slate: "#475569",
          line: "#CBD5E1",
        },
      },
      boxShadow: {
        command: "0 14px 30px rgba(8, 32, 51, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
