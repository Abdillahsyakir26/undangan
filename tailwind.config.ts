import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: 'rgb(var(--c-gold) / <alpha-value>)',
        goldDeep: 'rgb(var(--c-gold-deep) / <alpha-value>)',
        sage: 'rgb(var(--c-sage) / <alpha-value>)',
        sageDeep: 'rgb(var(--c-sage-deep) / <alpha-value>)',
        cream: 'rgb(var(--c-cream) / <alpha-value>)',
        creamDeep: 'rgb(var(--c-cream-deep) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
        script: ['"Great Vibes"', 'cursive'],
        arab: ['Amiri', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
