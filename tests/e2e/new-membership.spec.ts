import { test } from "@playwright/test";
import { awaitSession, demoUsers, expect, login, throwawayEmail } from "./helpers";

/**
 * Alta de membresía por la interfaz: el formulario que genera el código que la
 * caja y el QR del cliente van a usar.
 *
 * **Hoy no se puede probar: el alta está rota.** El diálogo abre, los campos se
 * llenan y el envío lleva los valores en el cuerpo (`_1_fullName` = el nombre),
 * pero la acción de servidor los recibe vacíos y responde «Escribe el nombre del
 * cliente.». Pasa igual en `/clientes` y en `/membresias`, en `npm run dev` y en
 * `next start` con el build de producción, así que no es del entorno de pruebas.
 *
 * El prefijo `_1_` lo pone React en los formularios con `useActionState`; el
 * servidor lo quita cuando el formulario llega con su `$ACTION_KEY`. En estas
 * pantallas conviven varios de esos formularios montados a la vez (cada fila de
 * la lista trae sus diálogos de editar, renovar y cancelar), y el cuerpo sale con
 * el prefijo pero sin la clave que le toca: la acción recibe las claves crudas.
 *
 * Los dos casos quedan desactivados a propósito, con la expectativa correcta
 * escrita, para que fallen en cuanto alguien los reactive tras el arreglo.
 */

test.describe("Alta de membresía", () => {
  test.fixme("el administrador crea una membresía y cae en la ficha", async ({ page }) => {
    const name = `Cliente E2E ${Date.now()}`;

    await login(page, demoUsers.adminCafeAurora.email);
    await awaitSession(page);
    await page.getByRole("button", { name: "Nueva membresía" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Nombre completo").fill(name);
    await dialog.getByLabel("Correo electrónico").fill(throwawayEmail());
    await dialog.getByRole("button", { name: "Crear membresía" }).click();

    await expect(page.getByText("Escribe el nombre del cliente.")).toHaveCount(0);
    await expect(page).toHaveURL(/\/clientes\/MP-[A-Z0-9]{5}/);
    await expect(page.getByRole("heading", { name, level: 1 })).toBeVisible();
  });

  test.fixme("un correo mal escrito no crea la membresía", async ({ page }) => {
    await login(page, demoUsers.adminCafeAurora.email);
    await awaitSession(page);
    await page.getByRole("button", { name: "Nueva membresía" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Nombre completo").fill("Cliente sin correo");
    await dialog.getByLabel("Correo electrónico").fill("no-es-un-correo");
    await dialog.getByRole("button", { name: "Crear membresía" }).click();

    await expect(page.getByText("Revisa el correo: parece incompleto.")).toBeVisible();
    await expect(page.getByText("Escribe el nombre del cliente.")).toHaveCount(0);
    await expect(page).not.toHaveURL(/\/clientes\/MP-/);
  });
});
