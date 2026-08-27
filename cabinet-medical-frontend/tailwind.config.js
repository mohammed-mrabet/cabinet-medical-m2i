export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#e8eaf4',
          100: '#c5c9e2',
          500: '#3d4b8f',
          600: '#1E2761',
          700: '#181f50',
          800: '#12173d',
          900: '#0c0f2a',
        },
        teal: {
          400: '#0a7fa8',
          500: '#065A82',
          600: '#054e71',
        }
      }
    }
  },
  plugins: []
}
