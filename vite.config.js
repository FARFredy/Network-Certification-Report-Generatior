import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Establece la base apuntando al subdirectorio de GitHub Pages
  base: '/Network-Certification-Report-Generatior/',
  plugins: [react()],
})