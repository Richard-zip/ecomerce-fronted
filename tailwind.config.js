/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta exacta solicitada:
        navy: {
          DEFAULT: '#102A43',
          main: '#102A43',
          secondary: '#243B53',
          hover: '#243B53',
          dark: '#0B1D30',
        },
        gold: {
          DEFAULT: '#D6A84F',
          accent: '#D6A84F',
          hover: '#C4973E',
          light: '#FBF5EA',
          border: '#E6C98B',
        },
        canvas: '#F5F7FA',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#1F2933',
          primary: '#1F2933',
          secondary: '#627D98',
        },
        line: {
          DEFAULT: '#D9E2EC',
        },
        status: {
          success: '#2F855A',
          error: '#C53030',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        control: '8px',
        card: '12px',
      },
      boxShadow: {
        sm: '0 1px 3px 0 rgba(16, 42, 67, 0.06), 0 1px 2px 0 rgba(16, 42, 67, 0.04)',
        card: '0 2px 4px -1px rgba(16, 42, 67, 0.06), 0 1px 2px -1px rgba(16, 42, 67, 0.04)',
        soft: '0 1px 3px 0 rgba(16, 42, 67, 0.06)',
        'soft-lg': '0 4px 6px -1px rgba(16, 42, 67, 0.08), 0 2px 4px -1px rgba(16, 42, 67, 0.04)',
      }
    },
  },
  plugins: [],
}
