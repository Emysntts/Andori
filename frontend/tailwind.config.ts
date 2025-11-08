import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
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

