/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Futura', 'Questrial', 'sans-serif'],
      },
      colors: {
        theme: {
          darkblue: '#002B57',
        },
      },
    },
  },
  plugins: [],
};
