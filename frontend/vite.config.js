import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // To import modules from src folder
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // To avoid CORS (Cross-Origin Resource Sharing) issues during development
  server: {
    proxy: {
      // Any request starting with /api
      "/api": {
        target: "http://localhost:3000", // Backend server
        changeOrigin: true,
        secure: false,
      },
      // Any request starting with uploads too
      "/uploads": {
        target: "http://localhost:3000", // Backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
