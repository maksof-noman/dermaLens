/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        peach: {
          50: '#fff7ed',
          100: '#ffedd5',
        },
      },
    },
  },
  plugins: [],
};
