import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'mazaya-green': '#005B41',
        'mazaya-green-light': '#007A57',
        'mazaya-green-pale': '#E8F5F0',
        'mazaya-bg': '#F8F7F4',
      },
    },
  },
  plugins: [],
}
export default config
