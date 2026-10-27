import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    // Vite 7 targets Safari 16+ by default. Lower the JS/CSS syntax target so
    // older iPhones/iPads (iOS 14-15) and older Edge/Chrome also run the app.
    build: {
      target: ["es2020", "safari14", "chrome90", "edge90", "firefox90"],
    },

    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});