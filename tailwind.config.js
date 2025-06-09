/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#006A71',
        secondary: '#48A6A7',
        semiLight: '#9ACBD0',
        light: '#F2EFE7',
        secondGround: '#E7E2D7',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
      },
      boxShadow: {
        'custom': '0 4px 6px -1px rgba(0, 106, 113, 0.1), 0 2px 4px -1px rgba(0, 106, 113, 0.06)',
      },
      animation: {
        'bouncing': 'bouncing 1.5s infinite',
        'up-and-down': 'up-and-down 4s linear infinite',
      },
      keyframes: {
        bouncing: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'up-and-down': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-60px)' },
        }
      }
    },
  },
  plugins: [],
}