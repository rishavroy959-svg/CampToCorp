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
          primary: "#1B4F72",
          "primary-hover": "#2874A6",
          accent: "#3498DB",
          bg: "#F8FAFC",
          surface: "#FFFFFF",
          "text-primary": "#0F172A",
          "text-secondary": "#64748B",
          border: "#E2E8F0",
          success: "#16A34A",
          warning: "#D97706",
          danger: "#DC2626",
          info: "#2563EB",
          dark: {
            bg: "#0F172A",
            surface: "#1E293B",
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
        card: "0 1px 3px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
      },
      borderRadius: {
        card: "14px",
        button: "10px",
      }
    },
  },
  plugins: [],
};

export default config;
