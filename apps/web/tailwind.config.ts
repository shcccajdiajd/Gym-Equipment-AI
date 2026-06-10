import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fern: '#1F4D2E',
        leaf: '#2E7D4E',
        acid: '#C4FF3D',
        ink: '#1F4D2E',
        carbon: '#0B0F0D',
        slate: '#6B7280',
        tertiary: '#9CA3AF',
        oat: '#FAFAF7',
        cream: '#FFFFFF',
        clay: '#EF4444',
        amber: '#FBBF24',
        orange: '#F97316',
        moss: '#EFF8E7',
        line: '#E5E7EB',
        info: '#3B82F6'
      },
      boxShadow: {
        soft: '0 16px 34px rgba(31, 77, 46, 0.10)',
        lift: '0 24px 56px rgba(31, 77, 46, 0.14)',
        press: '0 8px 20px rgba(31, 77, 46, 0.08)',
        acid: '0 10px 28px rgba(196, 255, 61, 0.35)'
      },
      fontFamily: {
        display: ['Avenir Next', 'PingFang SC', 'Hiragino Sans GB', 'sans-serif'],
        body: ['Avenir', 'PingFang SC', 'Hiragino Sans GB', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config;
