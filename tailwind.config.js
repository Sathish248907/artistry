/**
 * Minimal, single-palette theme: every colour is a rose-gold tone.
 * Legacy tokens (ivory, cream, peach, champagne, gold) are kept as aliases so existing
 * classes resolve into the same palette — backgrounds all share one rose-white,
 * so sections never shift colour.
 */
const BASE = '#FFFAF9'; // the one page background
const ROSE = {
  DEFAULT: '#B76E79', // rose gold
  deep: '#9E5A66', // text accents, hover
  light: '#E8C4C4', // hairlines, subtle fills
  mist: BASE,
  blush: '#FBF1F0', // quiet tint for small UI (chips, icon wells) only
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rose: ROSE,
        ivory: BASE,
        cream: BASE,
        peach: BASE,
        champagne: BASE,
        gold: { DEFAULT: '#B76E79', soft: '#E8C4C4' },
        ink: { DEFAULT: '#4F3337', soft: '#86686C', faint: '#B39A9D' },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        rose: '0 2px 12px -6px rgba(183, 110, 121, 0.22)',
        'rose-lg': '0 14px 34px -20px rgba(183, 110, 121, 0.35)',
        soft: '0 1px 3px rgba(183, 110, 121, 0.08)',
      },
      backgroundImage: {
        'rose-gold': 'linear-gradient(135deg, #B76E79 0%, #C98A8F 100%)',
      },
      letterSpacing: { luxe: '0.28em' },
      screens: { '3xl': '1920px' },
    },
  },
  plugins: [],
};
