/** @type {import('tailwindcss').Config} */
export default {
  // Toggle dark mode by adding/removing the `dark` class on <html>.
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Kurdish / Arabic-script friendly font stack.
      // 'LatinDigits' (defined in index.css) only covers 0-9 and forces
      // Western/Latin numerals; everything else falls through to Vazirmatn.
      fontFamily: {
        // NRT: a Kurdish (Sorani) font, self-hosted via @font-face in index.css.
        // 'LatinDigits' sits in front of it so only 0-9 map to a Latin system
        // font (Western numerals); all other glyphs fall through to NRT.
        sans: [
          'LatinDigits',
          'NRT',
          'Tahoma',
          'sans-serif',
        ],
      },
      // Soft pastel design tokens used across the app.
      colors: {
        // The accent ("brand") scale is driven by CSS variables so the active
        // color theme (see index.css + AppContext) can swap it instantly.
        // Channels are stored as "R G B" to keep Tailwind opacity modifiers working.
        brand: {
          50: 'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          200: 'rgb(var(--brand-200) / <alpha-value>)',
          300: 'rgb(var(--brand-300) / <alpha-value>)',
          400: 'rgb(var(--brand-400) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
        },
        blush: {
          100: '#ffe9f3',
          200: '#ffd1e6',
          300: '#ffb3d6',
        },
        sky: {
          soft: '#dbeeff',
          softer: '#eef6ff',
        },
        // Dark-theme surfaces (deep navy / soft charcoal).
        night: {
          900: '#0f1226',
          800: '#171a33',
          700: '#22264a',
          600: '#2f3460',
        },
      },
      boxShadow: {
        soft: '0 8px 30px rgba(139, 92, 246, 0.12)',
        card: '0 4px 20px rgba(31, 38, 135, 0.08)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
