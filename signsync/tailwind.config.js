/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#1C1C1C",
          800: "#2A2A2A",
          700: "#3A3A3A",
          600: "#525252",
          500: "#737373",
          400: "#A3A3A3",
          300: "#D4D4D4",
        },
        signal: {
          50:  "#D8F3DC",
          100: "#B7E4C7",
          200: "#95D5B2",
          300: "#74C69D",
          400: "#52B788",
          500: "#40916C",
          600: "#2D6A4F",
          700: "#1B4332",
          800: "#103026",
          900: "#081C15",
        },
        coral: {
          400: "#FF8B7A",
          500: "#FB6F58",
          600: "#E4553E",
        },
        mint: {
          400: "#4CD9B0",
          500: "#22C098",
        },
        beige: {
          50:  "#FAF7F2",
          100: "#F5EFE6",
          200: "#EDE0D4",
        },
        paper: "#FAF7F2",
        glass: "rgba(255,255,255,0.08)",
        sage: "#B1D3B9",
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        body:    ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft:         "0 2px 8px rgba(40,80,40,0.06), 0 12px 32px rgba(40,80,40,0.08)",
        card:         "0 1px 2px rgba(40,80,40,0.04), 0 8px 24px rgba(40,80,40,0.07)",
        elevated:     "0 4px 6px -1px rgba(40,80,40,0.08), 0 20px 48px -8px rgba(40,80,40,0.15)",
        glass:        "0 8px 32px rgba(40,80,40,0.18), inset 0 1px 0 rgba(255,255,255,0.12)",
        "glow-mint":  "0 0 24px rgba(76,217,176,0.35)",
        "glow-signal":"0 0 20px rgba(64,145,108,0.30)",
        glow:         "0 0 0 4px rgba(64,145,108,0.15)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-10px)" },
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.35" },
          "50%":       { opacity: "1" },
        },
        dashMove: {
          to: { strokeDashoffset: "0" },
        },
        pingOnce: {
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
      },
      animation: {
        floaty:    "floaty 5s ease-in-out infinite",
        pulseLine: "pulseLine 2.2s ease-in-out infinite",
        dashMove:  "dashMove 2.4s ease-out forwards",
        pingOnce:  "pingOnce 1s cubic-bezier(0,0,0.2,1) infinite",
      },
    },
  },
  plugins: [],
};
