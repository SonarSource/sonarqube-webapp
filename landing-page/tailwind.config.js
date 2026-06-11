/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sonar: {
          blue: '#126ED3',
          'blue-hover': '#0C5DB5',
          'blue-gradient': '#0F63BF',
          'blue-light': '#EEF4FC',
          'blue-border': '#B7D3F2',
          ink: '#290042',
          muted: '#69809B',
          'section-alt': '#F7F9FC',
        },
      },
      fontFamily: {
        display: ['Poppins', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        cta: '0.15em',
      },
      maxWidth: {
        content: '1120px',
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
}
