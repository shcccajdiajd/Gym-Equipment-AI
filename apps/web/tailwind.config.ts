import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fern: '#1f6f4a',
        ink: '#13251d',
        oat: '#f4efe4',
        clay: '#d97d54',
        moss: '#dbe8d7'
      },
      boxShadow: {
        soft: '0 18px 48px rgba(19, 37, 29, 0.14)'
      },
      fontFamily: {
        display: ['Avenir Next', 'PingFang SC', 'Hiragino Sans GB', 'sans-serif'],
        body: ['Avenir', 'PingFang SC', 'Hiragino Sans GB', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config;
