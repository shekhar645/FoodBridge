/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#f97316',
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea6c00',
        },
        ink: '#0d0d0d',
        surface: '#f8f8f6',
      },
      fontSize: {
        '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
      },
    },
  },
  plugins: [],
}
