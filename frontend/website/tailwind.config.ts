import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mazaya: {
          green: "#005B41",
          "green-dark": "#004A36",
          "green-light": "#F0F8F5",
          topbar: "#1a1a1a",
          footer: "#1a1a1a",
          "footer-text": "#CCCCCC",
          "card-border": "#E0E0E0",
          "section-alt": "#F5F5F5",
          "bubble-agent": "#F8F7F4",
          "quick-reply-border": "#E8E5DF",
        },
      },
      fontFamily: {
        heading: ["Georgia", "Times New Roman", "serif"],
        body: ["Arial", "Helvetica Neue", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
