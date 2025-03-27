/** @type {import('tailwindcss').Config} */
import tailwindAnimate from "tailwindcss-animate";
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border, 0, 0%, 80%))", // Default fallback
        input: "hsl(var(--input, 0, 0%, 90%))",
        ring: "hsl(var(--ring, 210, 100%, 50%))",
        background: "hsl(var(--background, 0, 0%, 10%))",
        foreground: "hsl(var(--foreground, 0, 0%, 100%))",
        primary: {
          DEFAULT: "hsl(var(--primary, 200, 80%, 50%))",
          foreground: "hsl(var(--primary-foreground, 0, 0%, 100%))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary, 160, 80%, 50%))",
          foreground: "hsl(var(--secondary-foreground, 0, 0%, 100%))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background, 220, 20%, 10%))",
          foreground: "hsl(var(--sidebar-foreground, 0, 0%, 100%))",
          primary: "hsl(var(--sidebar-primary, 220, 80%, 50%))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground, 0, 0%, 100%))",
          accent: "hsl(var(--sidebar-accent, 50, 100%, 50%))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground, 0, 0%, 100%))",
          border: "hsl(var(--sidebar-border, 0, 0%, 30%))",
          ring: "hsl(var(--sidebar-ring, 210, 100%, 50%))",
        },
        dark: "#1a1a1a",
        "dark-lighter": "#222222",
        "dark-lightest": "#2a2a2a",
        teal: {
          light: "#4fd1c5",
          DEFAULT: "#38b2ac",
          dark: "#319795",
        },
        lightgray: {
          lighter: "#f7f7f7",
          light: "#e4e4e4",
          DEFAULT: "#d4d4d4",
          dark: "#b0b0b0",
        },
      },
      borderRadius: {
        lg: "var(--radius, 12px)",
        md: "calc(var(--radius, 12px) - 2px)",
        sm: "calc(var(--radius, 12px) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "fade-up": "fade-up 0.8s ease-out",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "slide-in-left": "slide-in-left 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [tailwindAnimate],
};
