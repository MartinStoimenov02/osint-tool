import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // ДОБАВИ ТОВА

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // ДОБАВИ ТОВА
  ],
})