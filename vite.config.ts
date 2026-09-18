import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Vite uses its Tailwind plugin; the PostCSS config is for Expo/Metro.
  css: { postcss: { plugins: [] } },
  server: {
    host: true,
    port: 5173,
  },
})
