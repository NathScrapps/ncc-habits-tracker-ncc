import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lavender: '#d3c5f6',
        'deep-purple': '#3b2a60',
        'light-gray': '#f0f0f0',
      },
    },
  },
  plugins: [],
} satisfies Config
