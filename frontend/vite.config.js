import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Le backend Spring Boot (SecurityConfig.corsConfigurationSource) autorise
// uniquement les origines http://localhost:4200 et http://localhost:3000.
// On fait donc tourner Vite sur le port 3000 pour éviter tout blocage CORS,
// sans avoir à modifier le backend déjà validé.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
  },
})
