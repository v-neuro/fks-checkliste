import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Keep Vite 7's browser support when upgrading the build tooling.
  build: {
    target: ['chrome107', 'edge107', 'firefox104', 'safari16'],
  },
})
