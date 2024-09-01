/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'my-blue-400': '#04dcd1',
        'my-blue-600': '#038c85',

        'my-yellow-400': '#ffa320',
        'my-yellow-600': '#cc7700',

        'my-pink-400': '#fb37ad',
        'my-pink-600': '#f00592',

        'my-white': '#f0edde',

        'my-grey-600': '#6d6d6d',
        'my-grey-800': '#3d3d3d',

        'my-black': '#0c0c0c'
      }
    },
  },
  plugins: [],
}

