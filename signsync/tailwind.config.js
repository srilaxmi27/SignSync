/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0B1220",
          800: "#111C31",
          700: "#1D2B45",
          600: "#334463",
          500: "#526080",
          400: "#7C8AA6",
          300: "#AAB5C8",
        },
        signal: {
          50: "#EEF4FF",
          100: "#DCE9FF",
          200: "#B4D0FF",
          300: "#7FB0FF",
          400: "#4C8DFF",
          500: "#2563EB",
          600: "#1B4FCB",
          700: "#173F9E",
          800: "#152F73",
          900: "#0F2054",
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
        paper: "#F7F9FC",
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px rgba(15, 32, 84, 0.06), 0 12px 32px rgba(15, 32, 84, 0.08)",
        card: "0 1px 2px rgba(15, 32, 84, 0.04), 0 8px 24px rgba(15, 32, 84, 0.06)",
        glow: "0 0 0 4px rgba(37, 99, 235, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "1" },
        },
        dashMove: {
          to: { strokeDashoffset: "0" },
        },
      },
      animation: {
        floaty: "floaty 5s ease-in-out infinite",
        pulseLine: "pulseLine 2.2s ease-in-out infinite",
        dashMove: "dashMove 2.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};
