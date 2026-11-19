import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // Lógica pura que duplica el backend o decide formato: una divergencia
      // se cobra mal en caja y ninguna otra prueba la ve.
      include: [
        "src/lib/pricing.ts",
        "src/lib/format.ts",
        "src/lib/customer-errors.ts",
        "src/lib/tenant-theme.ts",
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
