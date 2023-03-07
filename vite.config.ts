import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/ichitabi-timer/",
  assetsInclude: ["robots.txt", "manifest.json"],
})
