/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        industrial: {
          blue: '#1e40af',
          dark: '#0f172a',
          gray: '#1e293b',
          light: '#64748b',
        }
      }
    },
  },
  plugins: [],
}
