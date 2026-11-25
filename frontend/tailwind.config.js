/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f6fe',
          100: '#ddebfe',
          200: '#c3ddfc',
          300: '#98c6fa',
          400: '#64a7f6',
          500: '#3b82f6',
          600: '#1d4ed8', // authoritative corporate blue
          700: '#1e40af', // deep navy blue
          800: '#1e3a8a',
          900: '#0f172a', // executive dark slate
          950: '#0a0f1d',
        },
      },
    },
  },
  plugins: [],
};
