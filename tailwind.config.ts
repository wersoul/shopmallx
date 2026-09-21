import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // brand-* classes are driven by CSS variables defined in globals.css.
        // SiteShell reads `primary_color` from settings and rewrites these
        // variables at runtime, so the admin can re-skin the whole site
        // without redeploying.
        brand: {
          50: 'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          200: 'rgb(var(--brand-200) / <alpha-value>)',
          300: 'rgb(var(--brand-300) / <alpha-value>)',
          400: 'rgb(var(--brand-400) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
          900: 'rgb(var(--brand-900) / <alpha-value>)'
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