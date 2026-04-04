/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-base":    "#050a06",
        "bg-surface": "rgba(10,20,12,0.8)",
        "bg-card":    "rgba(20,40,24,0.6)",
        "green-primary": "#1a7a3c",
        "green-accent":  "#2dd668",
        "text-primary":  "#f0faf2",
        "text-secondary":"rgba(240,250,242,0.6)",
        "text-muted":    "rgba(240,250,242,0.35)",
      },
      fontFamily: {
        sora:  ["Sora",  "sans-serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        float:     "float 12s ease-in-out infinite",
        "float-r": "float 16s ease-in-out infinite reverse",
        "float-s": "float 10s ease-in-out infinite",
        marquee:   "marquee 28s linear infinite",
        ringPulse: "ringPulse 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)"    },
          "50%":      { transform: "translateY(-30px)"  },
        },
        marquee: {
          "0%":   { transform: "translateX(0)"     },
          "100%": { transform: "translateX(-50%)"  },
        },
        ringPulse: {
          "0%,100%": { transform: "scale(1)",    opacity: "1" },
          "50%":      { transform: "scale(1.02)", opacity: "0.85" },
        },
      },
    },
  },
  plugins: [],
};
