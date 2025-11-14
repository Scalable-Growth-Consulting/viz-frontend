import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy AWS API Gateway to avoid CORS in local dev
      '/dev': {
        target: 'https://nhqln6zib4.execute-api.ap-south-1.amazonaws.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
