/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Identidade SUS + Apple Palette
        sus: {
          DEFAULT: "#0057b8",
          dark: "#004494",
          light: "#e6eff8",
        },
        apple: {
          gray: "#F2F2F7",
          label: "#1C1C1E",
          secondary: "#8E8E93",
        },
      },
      borderRadius: {
        // O "Canto Arredondado" característico da Apple
        'apple': '32px',
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.3))',
      },
    },
  },
  plugins: [],
};