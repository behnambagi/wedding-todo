/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        ivory: {
          50: '#FDFBF7',
          100: '#F8F4EC',
          200: '#EFE6D5',
        },
        champagne: {
          400: '#D4AF37',
          500: '#C59B27',
          600: '#A67C1E',
        },
        sage: {
          50: '#F4F7F4',
          100: '#E3EBE3',
          600: '#4A6B53',
          700: '#38523F',
        },
        rose: {
          50: '#FDF6F6',
          100: '#FBE8E8',
          600: '#B85D6F',
        }
      }
    },
  },
  plugins: [],
}
