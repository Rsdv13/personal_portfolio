import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Deployed as a GitHub Pages USER site (Rsdv13.github.io) -> served at domain root.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
})
