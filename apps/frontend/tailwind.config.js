/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'mfx-orange': '#FF7A3D',
        'mfx-coral': '#FF5733',
        'mfx-dark': '#1A1A2E',
        'mfx-gold': '#FFB84D',
        primary: '#FF7A3D',
        secondary: '#FF5733',
      },
    },
  },
  plugins: [],
}
