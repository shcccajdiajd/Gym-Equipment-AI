import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fern: '#1f6f4a',
        leaf: '#2f8a5b',
        ink: '#13251d',
        slate: '#5d6c62',
        oat: '#f4efe4',
        cream: '#fbfaf5',
        clay: '#d97d54',
        amber: '#f2b36d',
        moss: '#dbe8d7',
        line: '#e7dfd2'
      },
      boxShadow: {
        soft: '0 18px 48px rgba(19, 37, 29, 0.14)',
        lift: '0 22px 60px rgba(19, 37, 29, 0.16)',
        press: '0 8px 24px rgba(19, 37, 29, 0.10)'
      },
      fontFamily: {
        display: ['Avenir Next', 'PingFang SC', 'Hiragino Sans GB', 'sans-serif'],
        body: ['Avenir', 'PingFang SC', 'Hiragino Sans GB', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config;
