import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/payments": "http://localhost:8000",
      "/auth": "http://localhost:8001",
      "/health": "http://localhost:8000",
    },
  },
});
