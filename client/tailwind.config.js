/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  darkMode: false, // disables Tailwind's dark mode
  daisyui: {
    themes: ["light"], // only includes the light theme
    darkTheme: false,  // disables DaisyUI's dark theme switching
  },
};
