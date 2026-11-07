/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./config.js",
  ],
  theme: {
    extend: {
      colors: {
        "brand-navy": "#0F2747",
        "brand-gold": "#B8924A",
        "deep-red": "#990000",
        background: "#f1f0eb",
        border: "#E5E5E5",
        text: {
          DEFAULT: "#000000",
          secondary: "#666666",
        },
        "accent-light": "#F5F5F5",
      },
      borderRadius: {
        card: "8px",
      },
    },
  },
  plugins: [],
};
