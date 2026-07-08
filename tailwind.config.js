/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,ts,html}", "./index.html"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#1A1A18",
          700: "#3D3B35",
          600: "#57544C",
          400: "#9C988E",
          200: "#D8D4C7",
        },
        cream: {
          50: "#F6F3EC",
          100: "#EFEBE0",
        },
        surface: "#FFFFFF",
        gold: {
          50: "#FDF6E3",
          100: "#FBEBC0",
          300: "#F8D876",
          500: "#F4C43D",
          600: "#E3A916",
        },
        green: {
          100: "#DBF3E7",
          500: "#33C77E",
          600: "#1E9A5C",
        },
        red: {
          500: "#E1503F",
        },
        line: {
          200: "#EAE5D8",
          300: "#DEDACB",
        },
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "display-xl": ["34px", { lineHeight: "1.15", fontWeight: "800", letterSpacing: "-0.02em" }],
        "display-lg": ["24px", { lineHeight: "1.2", fontWeight: "700" }],
        title: ["18px", { lineHeight: "1.3", fontWeight: "700" }],
        "body-sz": ["15px", { lineHeight: "1.5", fontWeight: "500" }],
        label: ["13px", { lineHeight: "1.4", fontWeight: "600" }],
        caption: ["11px", { lineHeight: "1.4", fontWeight: "700", letterSpacing: "0.06em" }],
      },
      borderRadius: {
        sm: "10px",
        md: "16px",
        lg: "24px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 10px 28px rgba(26,26,24,0.07)",
        nav: "0 12px 24px rgba(26,26,24,0.28)",
      },
      spacing: {
        4.5: "18px",
      },
    },
  },
  plugins: [],
};
