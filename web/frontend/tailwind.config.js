/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './**/*.{js,jsx,tsx}'],
  mode: 'jit',
  theme: {
    extend: {},
    screens: {
      sm: '490px',
      md: '768px',
      lg: '1040px',
      xl: '1440px',
    },
  },
  plugins: [],
};
