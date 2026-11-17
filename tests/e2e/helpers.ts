import { expect, type Page } from "@playwright/test";

/** Contraseña de los usuarios de demo (`uv run python -m scripts.seed` en Member-Web). */
export const demoPassword = process.env.E2E_DEMO_PASSWORD ?? "demo12345";

export const demoUsers = {
  adminCafeAurora: { email: "admin@cafe-aurora.mx", business: "Café Aurora" },
  cajaCafeAurora: { email: "caja@cafe-aurora.mx", business: "Café Aurora" },
  adminGimnasio: { email: "admin@gimnasio-titan.mx", business: "Gimnasio Titán" },
} as const;

/**
 * Llena el formulario de login y envía. No espera a la redirección: cada prueba
 * decide qué comprobar (URL del rol, mensaje de error, contenido del panel).
 */
export async function login(page: Page, email: string, password = demoPassword) {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico", { exact: true }).fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
}

/**
 * Correo único por ejecución para las pruebas de credenciales inválidas: el API
 * bloquea un correo 15 minutos después de 5 intentos fallidos, así que nunca se
 * usa aquí un correo de demo.
 */
export function throwawayEmail() {
  return `e2e-${Date.now()}@cafe-aurora.mx`;
}

export { expect };
