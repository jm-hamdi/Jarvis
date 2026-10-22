import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 20_000,
  },
  use: {
    baseURL: "http://localhost:5173",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],
});
