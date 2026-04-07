/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // v6 Design tokens
        bg:           "#f0f0eb",
        "bg-card":    "#ffffff",
        "bg-dark":    "#1a1a1a",
        green:        { DEFAULT: "#1a7a3c", light: "#2dd668", pale: "#e8f5ee", border: "#c8e6d4" },
        "text-primary":   "#1a1a1a",
        "text-secondary": "#555555",
        "text-muted":     "#888888",
        border:       "#e8e8e3",
        // Chart palette
        chart: { 1:"#f97316", 2:"#14b8a6", 3:"#eab308", 4:"#6366f1", 5:"#ec4899", 6:"#1a7a3c" },
        // Landing pages
        "bg-base":       "#f0f0eb",
        "green-primary": "#1a7a3c",
        "green-accent":  "#2dd668",
        creator: { pink:"#e879f9", indigo:"#818cf8", blue:"#38bdf8" },
        brand:   { purple:"#7c3aed", indigo:"#4f46e5", violet:"#a855f7" },
      },
      fontFamily: {
        display: ['"Instrument Serif"', "serif"],
        heading: ['"Playfair Display"', "serif"],
        serif:   ['"Instrument Serif"', "serif"],
        body:    ['"DM Sans"', '"Neue Montreal"', "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "10px", md: "16px", lg: "20px", xl: "28px", pill: "100px",
      },
      boxShadow: {
        card:       "0 2px 12px rgba(0,0,0,0.06)",
        "card-hover":"0 8px 32px rgba(0,0,0,0.10)",
        green:      "0 4px 12px rgba(26,122,60,0.3)",
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
