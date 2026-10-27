/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          cream: '#F9E6A8',
          gold: '#F2A900',
          amber: '#CC6F00',
          espresso: '#4D2A00',
        },
        roast: {
          bg: '#120A05',
          card: '#1D1208',
          elevated: '#281A0E',
          border: '#3D2716',
          borderHover: '#F2A900',
          textMuted: '#B8A490',
          textLight: '#FBF5EC',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Cinzel', 'Playfair Display', 'serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px -5px rgba(242, 169, 0, 0.35)',
        'glow-amber': '0 0 25px -5px rgba(204, 111, 0, 0.35)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
