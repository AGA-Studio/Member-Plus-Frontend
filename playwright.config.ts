import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    locale: "es-MX",
    // La app respeta prefers-reduced-motion: con "reduce" se salta la animación
    // de entrada al panel (entry-transition.tsx devuelve false en begin()), así
    // que los snapshots del trace muestran la pantalla final y no la cortina.
    reducedMotion: "reduce",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Graba siempre solo cuando se pide: `PW_VIDEO=1 npm run test:e2e`. Sin la
    // variable, el vídeo se queda en los fallos (queda en test-results/*/video.webm).
    video: process.env.PW_VIDEO === "1" ? "on" : "retain-on-failure",
  },
  expect: { timeout: 10_000 },
  projects: [
    {
      // Guarda las sesiones por rol en tests/e2e/.auth/ antes de las pruebas.
      // Los demás proyectos dependen de este y `login.spec.ts` lo ignora.
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "escritorio",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
    },
    {
      name: "movil",
      use: { ...devices["Pixel 7"] },
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
