/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // Professional Tourist Safety App Color Palette
        'deep-teal': {
          DEFAULT: '#0F4C5C',
          50: '#E6F2F5',
          100: '#B8DCE3',
          200: '#8AC6D1',
          300: '#5CB0BF',
          400: '#2E9AAD',
          500: '#0F4C5C',
          600: '#0C3F4D',
          700: '#09323E',
          800: '#06252F',
          900: '#031820',
        },
        'soft-mint': {
          DEFAULT: '#2E8B8B',
          50: '#E8F5F5',
          100: '#C2E3E3',
          200: '#9CD1D1',
          300: '#76BFBF',
          400: '#50ADAD',
          500: '#2E8B8B',
          600: '#257272',
          700: '#1C5959',
          800: '#134040',
          900: '#0A2727',
        },
        'light-bg': {
          DEFAULT: '#F4F7F8',
          50: '#FFFFFF',
          100: '#FEFEFE',
          200: '#F4F7F8',
          300: '#EBF1F3',
          400: '#E2EBEE',
          500: '#D9E5E9',
        },
        danger: {
          DEFAULT: '#E53935',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#FFC107',
          foreground: '#000000',
        },
        success: {
          DEFAULT: '#4CAF50',
          foreground: '#FFFFFF',
        },
        primary: {
          DEFAULT: '#0F4C5C',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#2E8B8B',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#E53935',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F4F7F8',
          foreground: '#0C3F4D',
        },
        accent: {
          DEFAULT: '#2E8B8B',
          foreground: '#FFFFFF',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F4C5C',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F4C5C',
        },
        // Legacy compatibility
        'trust-blue': '#0F4C5C',
        'safety-green': '#4CAF50',
        'alert-red': '#E53935',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};