/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        albion: {
          gold: '#c8a84b',
          'gold-light': '#e8c96b',
          dark: '#0d0d0d',
          'card': '#1a1a1a',
          'card-hover': '#242424',
          border: '#2a2a2a',
        },
      },
    },
  },
  plugins: [],
}
