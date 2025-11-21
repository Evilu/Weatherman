import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      animation: {
        'float-bob': 'floatBob 3s ease-in-out infinite',
        'weather-spin': 'weatherSpin 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'atmospheric-drift': 'atmosphericDrift 30s ease-in-out infinite',
        'liquid-shimmer': 'liquidShimmer 2s ease-in-out infinite',
        'storm-pulse': 'stormPulse 2s ease-in-out infinite',
        'tab-glow': 'tabGlow 2s ease-in-out infinite',
        'stagger-fade-in': 'staggerFadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards',
      },
      keyframes: {
        floatBob: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(2deg)' },
        },
        weatherSpin: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.15)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        atmosphericDrift: {
          '0%, 100%': {
            transform: 'translate(0, 0) rotate(0deg) scale(1)',
            opacity: '0.6',
          },
          '25%': {
            transform: 'translate(5%, -5%) rotate(2deg) scale(1.05)',
            opacity: '0.8',
          },
          '50%': {
            transform: 'translate(-3%, 3%) rotate(-1deg) scale(0.98)',
            opacity: '0.7',
          },
          '75%': {
            transform: 'translate(3%, -2%) rotate(1deg) scale(1.02)',
            opacity: '0.75',
          },
        },
        liquidShimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        stormPulse: {
          '0%, 100%': {
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2), 0 0 20px rgba(239, 68, 68, 0.2)',
          },
          '50%': {
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.4)',
          },
        },
        tabGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        staggerFadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
export default config;
