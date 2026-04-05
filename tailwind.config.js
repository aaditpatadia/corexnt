/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // App greens
        "bg-base":       "#050a06",
        "bg-surface":    "rgba(10,20,12,0.8)",
        "bg-card":       "rgba(20,40,24,0.6)",
        "green-primary": "#1a7a3c",
        "green-accent":  "#2dd668",
        "text-primary":  "#f0faf2",
        "text-secondary":"rgba(240,250,242,0.6)",
        "text-muted":    "rgba(240,250,242,0.35)",
        // Green shades for Tailwind
        green: {
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
        },
        // Creator palette
        creator: {
          pink:   "#e879f9",
          indigo: "#818cf8",
          blue:   "#38bdf8",
        },
        // Brand palette
        brand: {
          purple: "#7c3aed",
          indigo: "#4f46e5",
          violet: "#a855f7",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        serif:   ['"Instrument Serif"', "serif"],
        body:    ['"Neue Montreal"', "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        float:        "float 12s ease-in-out infinite",
        "float-r":    "float 16s ease-in-out infinite reverse",
        "float-s":    "float 10s ease-in-out infinite",
        marquee:      "marquee 28s linear infinite",
        ringPulse:    "ringPulse 3s ease-in-out infinite",
        "bar-breath":  "barBreath 4s ease-in-out infinite",
        "fade-in":    "fadeIn 0.4s ease forwards",
        "slide-up":   "slideUp 0.4s ease forwards",
        "draw-check": "drawCheck 0.6s ease forwards",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-30px)" },
        },
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        ringPulse: {
          "0%,100%": { transform: "scale(1)",    opacity: "1" },
          "50%":      { transform: "scale(1.02)", opacity: "0.85" },
        },
        barBreath: {
          "0%,100%": { transform: "scaleY(1)" },
          "50%":      { transform: "scaleY(0.7)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        drawCheck: {
          from: { strokeDashoffset: "100" },
          to:   { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};
