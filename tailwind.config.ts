import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palet 05: Navy + White (#0F1E3A, #1E2F4F, #A7B6D0, #FFFFFF)
        indigo: {
          50: "#F4F7FB",
          100: "#E6ECF5",
          200: "#C9D5E8",
          300: "#A7B6D0",
          400: "#6E85AD",
          500: "#3B5582",
          600: "#1E2F4F",
          700: "#162542",
          800: "#121F3B",
          900: "#0F1E3A",
          950: "#0A1428",
        },
        sky: {
          50: "#F4F7FB",
          100: "#E6ECF5",
          200: "#C9D5E8",
          300: "#A7B6D0",
          400: "#7890B8",
          500: "#3B5582",
          600: "#1E2F4F",
          700: "#162542",
          800: "#0F1E3A",
          900: "#0F1E3A",
          950: "#0A1428",
        },
        navy: {
          deep: "#0F1E3A",
          mid: "#1E2F4F",
          soft: "#A7B6D0",
          white: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
