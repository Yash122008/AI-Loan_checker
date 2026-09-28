/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          950: '#05070d',
          900: '#0a0e1a',
          800: '#0f1424',
          700: '#161c30',
          600: '#1e2640',
          500: '#2a3354',
        },
        primary: {
          50: '#eef9ff',
          100: '#d8f0ff',
          200: '#b8e5ff',
          300: '#84d3ff',
          400: '#48b8ff',
          500: '#1f9bff',
          600: '#0879eb',
          700: '#0c60c0',
          800: '#11519b',
          900: '#14467c',
        },
        accent: {
          50: '#ecfffb',
          100: '#cfffe6',
          200: '#a3ffcc',
          300: '#62f8aa',
          400: '#25e884',
          500: '#06d167',
          600: '#00ab53',
          700: '#008744',
          800: '#066b38',
          900: '#075630',
        },
        gold: {
          400: '#f5c84b',
          500: '#e6b23a',
          600: '#cc9826',
        },
        danger: {
          400: '#ff6b6b',
          500: '#f04848',
          600: '#d92d2d',
        },
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(ellipse at top, rgba(31,155,255,0.12), transparent 60%)',
        'grid-faint':
          'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'slide-in': 'slideIn 0.4s ease-out forwards',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
