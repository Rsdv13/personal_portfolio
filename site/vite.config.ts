import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Deployed as a GitHub Pages PROJECT site at https://Rsdv13.github.io/personal_portfolio/
// (repo is "personal_portfolio", not "Rsdv13.github.io", so it's served under a subpath).
export default defineConfig({
  base: '/personal_portfolio/',
  plugins: [react(), tailwindcss()],
})
