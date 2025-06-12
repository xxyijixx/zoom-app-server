/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 使用class策略来控制暗黑模式
  theme: {
    extend: {},
  },
  plugins: [],
}