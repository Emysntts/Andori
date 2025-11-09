import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        andori: {
          pink: '#F995AD',
          paper: '#FFFEF1',
          cream: '#FFF1C4',
          sand: '#FFE496',
          gold: '#FFCA3A',
          blue: '#2857A4',
          sky: '#58B4EE',
          navy: '#01162A'
        },
        brand: {
          50: '#fff9e6',
          100: '#ffefbf',
          200: '#ffe38f',
          300: '#ffd65e',
          400: '#ffcb39',
          500: '#f7b800',
          600: '#d59b00',
          700: '#a97500',
          800: '#7d5400',
          900: '#553900'
        }
      },
      borderRadius: {
        xl: '1rem'
      }
    }
  },
  plugins: []
}

export default config

