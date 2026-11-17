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
 * Para seguir navegando después hay que esperar la sesión con `awaitSession()`.
 */
export async function login(page: Page, email: string, password = demoPassword) {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico", { exact: true }).fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
}

/**
 * Espera a que la sesión esté lista (la app ya salió de `/login`). Sin esto, un
 * `page.goto` inmediato después de `login()` cancela la petición de entrada y la
 * prueba sigue sin cookie, en la pantalla de login.
 */
export async function awaitSession(page: Page) {
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
}

/**
 * Correo único por ejecución para las pruebas de credenciales inválidas: el API
 * bloquea un correo 15 minutos después de 5 intentos fallidos, así que nunca se
 * usa aquí un correo de demo.
 */
export function throwawayEmail() {
  return `e2e-${Date.now()}@cafe-aurora.mx`;
}

/**
 * Abre el diálogo de escaneo desde `/caja`: el campo de código no está en la
 * página, vive dentro de ese diálogo.
 */
export async function openScanDialog(page: Page) {
  await page.goto("/caja");
  await page.getByRole("button", { name: "Escanear tarjeta" }).click();
  await expect(page.getByLabel("Código de la tarjeta")).toBeVisible();
}

/**
 * Escribe el código y busca. No espera resultado: si la tarjeta existe la página
 * pasa a `/caja?code=<código>` y el diálogo se cierra; si no, el aviso sale
 * dentro del diálogo y la URL no cambia.
 */
export async function searchCard(page: Page, code: string) {
  await page.getByLabel("Código de la tarjeta").fill(code);
  await page.getByRole("button", { name: "Buscar tarjeta" }).click();
}

/** Valor (`dd`) de una fila del resumen de la compra, localizado por su etiqueta. */
export function summaryRow(page: Page, label: string) {
  return page.locator("dl > div").filter({ hasText: label }).locator("dd").first();
}

export { expect };
