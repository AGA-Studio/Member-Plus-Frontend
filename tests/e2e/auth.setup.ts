import { test as setup } from "@playwright/test";
import { awaitSession, demoUsers, login } from "./helpers";

/**
 * Guarda una sesión por rol para que las pruebas arranquen dentro de la app en
 * vez de llenar el formulario de login en cada una. Corre una sola vez por
 * ejecución (proyecto `setup`, del que dependen los demás) y deja los archivos
 * en `tests/e2e/.auth/`, que está en `.gitignore`: llevan la cookie de sesión.
 *
 * La cookie caduca a las 8 h (`ACCESS_TOKEN_EXPIRE_MINUTES`), por eso no se
 * reutiliza un archivo viejo: se regenera en cada corrida.
 *
 * `login.spec.ts` no usa estas sesiones a propósito: es la prueba que sí verifica
 * el formulario de entrada.
 */
const sessions = [
  { file: "admin-aurora", email: demoUsers.adminCafeAurora.email },
  { file: "caja-aurora", email: demoUsers.cajaCafeAurora.email },
  { file: "admin-titan", email: demoUsers.adminGimnasio.email },
];

for (const { file, email } of sessions) {
  setup(`sesión de ${file}`, async ({ page }) => {
    await login(page, email);
    await awaitSession(page);
    await page.context().storageState({ path: `tests/e2e/.auth/${file}.json` });
  });
}
