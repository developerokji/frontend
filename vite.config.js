import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   server: {
    proxy: {
      "/api": {
        target: "http://13.234.214.196:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  }
})
