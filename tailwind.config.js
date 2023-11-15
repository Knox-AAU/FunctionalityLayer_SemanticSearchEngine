/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
      extend: {
        
          colors: {
              darkblue: '#023e8a',
              darkgrey: '#a9a9a9',
              lightblue: '#add8e6',
              lightgrey: '#d3d3d3',
              midnight: '#191970',
              olive: '#808000',
              orange: '#ffa500',
              purple: '#800080',
              rebeccapurple: '#663399',
              royalblue: '#4169e1',
              salmon: '#fa8072',
              seagreen: '#2e8b57',
          },
      },
  },
  plugins: [],
}
