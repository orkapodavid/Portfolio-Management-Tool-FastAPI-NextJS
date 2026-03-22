import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ctp: {
          base: "#1e1e2e",
          mantle: "#181825",
          crust: "#11111b",
          surface0: "#313244",
          surface1: "#45475a",
          surface2: "#585b70",
          overlay0: "#6c7086",
          overlay1: "#7f849c",
          text: "#cdd6f4",
          subtext0: "#a6adc8",
          subtext1: "#bac2de",
          blue: "#89b4fa",
          green: "#a6e3a1",
          red: "#f38ba8",
          yellow: "#f9e2af",
          peach: "#fab387",
          mauve: "#cba6f7",
          pink: "#f5c2e7",
          teal: "#94e2d5",
          lavender: "#b4befe",
        },
      },
    },
  },
  plugins: [],
};

export default config;
