/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-base": "#080810",
        "bg-card": "rgba(255,255,255,0.04)",
        "purple-core": "#7c3aed",
        "purple-light": "#a78bfa",
      },
      fontFamily: {
        sora: ["Sora", "sans-serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
