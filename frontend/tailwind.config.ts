import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cyan: { DEFAULT: "#22D3EE" },
        "blue-sec": "#38BDF8",
        "green-ok": "#22C55E",
        "violet-ag": "#A855F7",
        "orange-warn": "#F59E0B",
        "red-atk": "#EF4444",
        "yellow-tip": "#FACC15",
        "text-main": "#E6F6FF",
        "text-sec": "#7FA3C0",
        "text-off": "#4B6584",
        "panel-bg": "rgba(8,22,42,0.78)",
        "card-bg": "rgba(12,32,58,0.6)",
        "border-panel": "rgba(56,189,248,0.25)",
        "border-active": "rgba(34,211,238,0.7)",
        page: "#030914",
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        rajdhani: ["Rajdhani", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: { panel: "10px" },
      boxShadow: {
        panel: "0 0 0 1px rgba(56,189,248,0.25)",
        "panel-active":
          "0 0 0 1px rgba(34,211,238,0.7), 0 0 12px rgba(34,211,238,0.35)",
        "corner-glow": "0 0 8px rgba(34,211,238,0.4)",
      },
    },
  },
  plugins: [],
} satisfies Config;
