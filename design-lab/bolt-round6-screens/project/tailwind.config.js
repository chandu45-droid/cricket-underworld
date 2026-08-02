/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary palette
        underworld: {
          black: '#050608',
          void: '#0A0B0F',
          charcoal: '#12141A',
          slate: '#1A1D26',
          ash: '#262A35',
          fog: '#3A3F4D',
        },
        // Secondary palette
        ember: {
          burnt: '#B5470D',
          molten: '#D4621A',
          orange: '#FF6A00',
          amber: '#F59E0B',
          copper: '#B87333',
          gold: '#D4A017',
          metallic: '#E8B84A',
        },
        // Accent
        electric: {
          orange: '#FF7A1A',
          gold: '#FFD700',
        },
      },
      fontFamily: {
        display: ['"Teko"', 'sans-serif'],
        heading: ['"Rajdhani"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'ember-float': 'emberFloat 4s ease-in-out infinite',
        'sweep': 'sweep 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'smoke-drift': 'smokeDrift 8s ease-in-out infinite',
        'rotate-slow': 'rotateSlow 20s linear infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'flicker': 'flicker 4s ease-in-out infinite',
      },
      keyframes: {
        emberFloat: {
          '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: '0.4' },
          '50%': { transform: 'translateY(-20px) scale(1.2)', opacity: '0.8' },
        },
        sweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.3)' },
        },
        smokeDrift: {
          '0%': { transform: 'translateX(0) translateY(0)', opacity: '0' },
          '30%': { opacity: '0.3' },
          '70%': { opacity: '0.2' },
          '100%': { transform: 'translateX(40px) translateY(-30px)', opacity: '0' },
        },
        rotateSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '48%': { opacity: '1' },
          '49%': { opacity: '0.3' },
          '50%': { opacity: '1' },
          '52%': { opacity: '0.6' },
          '53%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
