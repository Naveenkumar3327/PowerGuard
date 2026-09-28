/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#05080C',
        surface: {
          50: '#1B2930',
          100: '#152129',
          200: '#101920',
          300: '#0C141A',
          400: '#080E13',
        },
        primary: {
          DEFAULT: '#8AD6A2',
          hover: '#A1E2B4',
          glow: 'rgba(138, 214, 162, 0.18)',
        },
        accent: {
          cyan: '#62D9E8',
          amber: '#EABF72',
          rose: '#EF7774',
          purple: '#A995D8',
        },
      },
      fontFamily: {
        sans: ['Bahnschrift', 'Aptos', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Cascadia Code', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 18px -7px rgba(138, 214, 162, 0.24)',
        'glow-cyan': '0 0 18px -7px rgba(98, 217, 232, 0.24)',
        'glow-amber': '0 0 18px -7px rgba(234, 191, 114, 0.2)',
        'glow-danger': '0 0 18px -7px rgba(239, 119, 116, 0.24)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
