/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Jan Setu design tokens - Blue + White government theme
        setu: {
          blue: "#0B4F9E",       // primary
          "blue-dark": "#063970", // primary pressed / headers
          "blue-light": "#E8F1FC", // tinted backgrounds, chips
          ink: "#14213D",         // primary text
          slate: "#5B6B85",       // secondary text
          bg: "#F7F9FC",          // app background
          marigold: "#F0A202",    // accent - CTAs, highlights (used sparingly)
          success: "#1B8354",
          warning: "#B8860B",
          error: "#C1272D",
        },
      },
      fontFamily: {
        display: ["Poppins", "Noto Sans Devanagari", "sans-serif"],
        body: ["Inter", "Noto Sans Devanagari", "sans-serif"],
      },
      borderRadius: {
        card: "1.25rem",
        pill: "999px",
      },
      boxShadow: {
        card: "0 4px 20px rgba(11, 79, 158, 0.08)",
        "card-hover": "0 8px 28px rgba(11, 79, 158, 0.14)",
        fab: "0 8px 24px rgba(240, 162, 2, 0.35)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "float-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
        "float-in": "float-in 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
