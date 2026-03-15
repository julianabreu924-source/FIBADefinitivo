export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base:     'var(--bg-base)',
        surface:  'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        hover:    'var(--bg-hover)',
        accent:   'var(--accent)',
        primary:  'var(--text-primary)',
        secondary:'var(--text-secondary)',
        muted:    'var(--text-muted)',
        border:   'var(--border)',
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        sans:    ['DM Sans', 'sans-serif'],
      }
    }
  },
  plugins: []
}
