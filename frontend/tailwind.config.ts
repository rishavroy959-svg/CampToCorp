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
        campus: {
          primary: "#4F46E5", // Electric Modern Indigo
          "primary-hover": "#4338CA",
          accent: "#06B6D4", // Electric Cyan
          "accent-purple": "#8B5CF6", // Radiant Violet
          "accent-pink": "#EC4899", // Neon Rose
          bg: "#F8FAFC",
          surface: "#FFFFFF",
          "text-primary": "#0F172A",
          "text-secondary": "#475569",
          border: "#E2E8F0",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
          info: "#3B82F6",
          dark: {
            bg: "#0B0F19",
            surface: "#111827",
            card: "#1E293B",
            text: "#F8FAFC",
          }
        },
      },
      spacing: {
        "space-1": "4px",
        "space-2": "8px",
        "space-3": "12px",
        "space-4": "16px",
        "space-6": "24px",
        "space-8": "32px",
        "space-12": "48px",
        "space-16": "64px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
        "card-hover": "0 12px 30px -10px rgba(79, 70, 229, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "glow-indigo": "0 0 25px -5px rgba(79, 70, 229, 0.35)",
        "glow-cyan": "0 0 25px -5px rgba(6, 182, 212, 0.35)",
      },
      borderRadius: {
        card: "16px",
        button: "12px",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        }
      }
    },
  },
  plugins: [],
};

export default config;
