/** @type {import('tailwindcss').Config} */
export default {
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
          "primary": "#FF2D55", // Landing primary, we use this globally as the brand accent
          "primary-dim": "#ffb3b5", // Dashboard primary
          "primary-container": "#680019",
          "on-primary-fixed": "#FFFFFF",
          "surface": "#0A0A0A", // or #131313
          "background": "#0A0A0A",
          "surface-container": "#141414",
          "surface-container-high": "#1E1E1E",
          "outline-variant": "rgba(255, 45, 85, 0.15)",
          "on-surface": "#E5E2E1",
          "on-surface-variant": "#A0A0A0",
          
          "on-tertiary-fixed-variant": "#005139",
          "error-container": "#93000a",
          "surface-container-highest": "#353534",
          "inverse-on-surface": "#313030",
          "inverse-primary": "#be0036",
          "secondary-fixed-dim": "#ffb3b5",
          "on-secondary": "#680019",
          "error": "#ffb4ab",
          "tertiary-fixed": "#82f9c6",
          "on-tertiary-fixed": "#002115",
          "on-secondary-fixed-variant": "#8b172b",
          "primary-fixed-dim": "#ffb3b5",
          "on-tertiary": "#003826",
          "tertiary-container": "#1fa478",
          "surface-dim": "#131313",
          "surface-container-low": "#1c1b1b",
          "surface-bright": "#3a3939",
          "on-secondary-fixed": "#40000c",
          "secondary-fixed": "#ffdada",
          "primary-fixed": "#ffdada",
          "on-primary-container": "#5b0015",
          "on-secondary-container": "#ff989e",
          "surface-container-lowest": "#0e0e0e",
          "on-primary-fixed-variant": "#920027",
          "surface-variant": "#353534",
          "on-background": "#e5e2e1",
          "secondary-container": "#8b172b",
          "surface-tint": "#ffb3b5",
          "on-tertiary-container": "#003121",
          "on-error-container": "#ffdad6",
          "outline": "#ad8888",
          "secondary": "#ffb3b5",
          "tertiary-fixed-dim": "#65dcab",
          "on-primary": "#680019",
          "inverse-surface": "#e5e2e1",
          "tertiary": "#65dcab",
          "on-error": "#690005"
      },
      "borderRadius": {
          "DEFAULT": "0.125rem",
          "lg": "0.5rem",
          "xl": "1rem",
          "2xl": "1.5rem",
          "full": "9999px"
      },
      "fontFamily": {
          "headline": ["Plus Jakarta Sans", "sans-serif"],
          "body": ["Plus Jakarta Sans", "sans-serif"],
          "label": ["Plus Jakarta Sans", "sans-serif"]
      },
      "animation": {
          "pulse-slow": "pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }
    },
  },
  plugins: [],
}
