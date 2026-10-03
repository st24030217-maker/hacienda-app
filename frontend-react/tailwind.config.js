/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        satoshi: ['Satoshi', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Anton', 'Satoshi', 'sans-serif'],
        anton: ['Anton', 'Satoshi', 'sans-serif'],
        mono: ['Satoshi', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
