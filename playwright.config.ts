import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

export default defineConfig({
  testDir: "./e2e", workers: 1, fullyParallel: false, retries: 0,
  timeout: 90_000, expect: { timeout: 15_000 }, reporter: "list",
  use: { baseURL: "http://localhost:8088", browserName: "chromium", channel: "msedge", headless: true,
    viewport: { width: 1366, height: 900 }, trace: "off", video: "off", screenshot: "only-on-failure" },
  webServer: [
    { command: "npm run test:web-server", cwd: resolve("../neurotalk-api"), url: "http://localhost:3018/api/v1/health", reuseExistingServer: false, timeout: 90_000 },
    { command: "npm run web -- --port 8088", url: "http://localhost:8088", reuseExistingServer: false, timeout: 120_000,
      env: { EXPO_PUBLIC_API_URL: "http://localhost:3018/api/v1", CI: "1", BROWSER: "none", NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ""} --dns-result-order=ipv4first`.trim() } },
  ],
});
