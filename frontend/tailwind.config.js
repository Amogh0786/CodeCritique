/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        glass: {
          bg: 'rgba(255, 255, 255, 0.08)',
          bgHover: 'rgba(255, 255, 255, 0.12)',
          border: 'rgba(255, 255, 255, 0.15)',
        },
        severity: {
          critical: 'rgba(239, 68, 68, 0.8)', // Red
          warning: 'rgba(245, 158, 11, 0.8)', // Amber
          info: 'rgba(56, 189, 248, 0.8)', // Blue
        },
        bgDeep: {
          100: '#0f0c29',
          200: '#302b63',
          300: '#24243e'
        }
      },
      backdropBlur: {
        glass: '20px',
      },
      borderRadius: {
        glass: '1.25rem', // 20px
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'shimmer': {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        }
      }
    },
  },
  plugins: [],
}
