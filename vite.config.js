import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/",      // đảm bảo đường dẫn assets đúng khi deploy
  plugins: [react()],
})