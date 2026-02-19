import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neon: {
          teal: "#00E4FF",
          cyan: "#2EC9FF",
          blue: "#1C7DFF",
          panel: "#0B1023"
        }
      },
      boxShadow: {
        glow: "0 0 30px rgba(0, 228, 255, 0.22)",
        glass: "0 12px 30px rgba(10, 15, 40, 0.45)"
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: []
} satisfies Config;
