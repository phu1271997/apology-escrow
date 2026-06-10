/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0a0813",
          card: "#0f0c1b",
          accent: "#8b5cf6",
          accentHover: "#a78bfa",
          cyan: "#06b6d4",
          cyanHover: "#22d3ee",
          gold: "#d4af37",
          goldHover: "#f3cd45",
        }
      },
      fontFamily: {
        serif: ["Outfit", "ui-serif", "Georgia", "Cambria", "Times New Roman", "Times", "serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
