/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#d4af37",
          dark: "#b8960f",
          light: "#f1c40f",
        },
        secondary: {
          DEFAULT: "#0a4a2f",
          dark: "#083d27",
          light: "#0c5738",
        },
      },
    },
  },
  plugins: [],
};

