/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        dark: "#111111",
        darker: "#000000",
        accent: "#60a5fa",
      },
    },
  },
  plugins: [],
};
