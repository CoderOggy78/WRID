/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', '"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"EB Garamond"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        canvas: {
          DEFAULT: '#FFFDF9',
          subtle: '#FAF7EE',
          ivory: '#FFFFEB',
          card: '#FFFFFF',
          sidebar: '#FBF9F2',
        },
        ink: {
          primary: '#1A1A1A',
          secondary: '#404040',
          muted: '#737373',
          faint: '#A3A3A3',
        },
        stone: {
          line: '#E4E4D0',
          border: '#D5D5BE',
          hover: '#F5F5E8',
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
        }
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px 0 rgba(20, 23, 26, 0.05), 0 1px 2px -1px rgba(20, 23, 26, 0.03)',
        'float': '0 10px 25px -3px rgba(20, 23, 26, 0.08), 0 4px 6px -4px rgba(20, 23, 26, 0.04)',
      }
    },
  },
  plugins: [],
}


