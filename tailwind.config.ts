import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f1',
          100: '#ffdfdf',
          200: '#ffc5c5',
          300: '#ff9d9d',
          400: '#ff6464',
          500: '#ff2d2d',
          600: '#ed1515',
          700: '#c81010',
          800: '#a40f13',
          900: '#881217'
        },
        ink: { DEFAULT: '#1f2937' }
      },
      fontFamily: {
        sans: ['Prompt', 'Sarabun', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.05)'
      }
    }
  },
  plugins: []
};
export default config;