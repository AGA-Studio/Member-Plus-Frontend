import { test } from "@playwright/test";
import { expect, gotoApp, randomCustomer } from "./helpers";

test.use({ storageState: "tests/e2e/.auth/admin-aurora.json" });

/**
 * Alta de membresía por la interfaz: el formulario que genera el código que la
 * caja y el QR del cliente van a usar.
 *
 * El nombre que usa la prueba es **solo letras** a propósito: el API lo valida
 * con `PersonName` (`schemas/validators.py` del backend), que rechaza dígitos y
 * símbolos, así que no se puede usar un timestamp para hacerlo único. De ahí
 * `randomCustomer()`, que genera palabra, nombre y correo con puras letras.
 *
 * El segundo caso está desactivado: con un nombre que no cumple la regla el
 * diálogo responde «Escribe el nombre del cliente.» aunque el campo esté lleno
 * (issue #57 del repo; la causa es el mapeo en `toFieldErrors`, no el envío).
 */

test.describe("Alta de membresía", () => {
  test("el administrador crea una membresía y cae en la ficha", async ({ page }) => {
    const { name, email } = randomCustomer();

    await gotoApp(page, "/clientes");
    await page.getByRole("button", { name: "Nueva membresía" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Nombre completo").fill(name);
    await dialog.getByLabel("Correo electrónico").fill(email);
    await dialog.getByRole("button", { name: "Crear membresía" }).click();

    await expect(page).toHaveURL(/\/clientes\/MP-[A-Z0-9]{5}/);
    await expect(page.getByRole("heading", { name, level: 1 })).toBeVisible();
    await expect(page.getByText(/MP-[A-Z0-9]{5}/).first()).toBeVisible();
  });

  test.fixme("un nombre con números explica la regla, no pide escribirlo", async ({ page }) => {
    const { email } = randomCustomer();

    await gotoApp(page, "/clientes");
    await page.getByRole("button", { name: "Nueva membresía" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Nombre completo").fill("Test 1234");
    await dialog.getByLabel("Correo electrónico").fill(email);
    await dialog.getByRole("button", { name: "Crear membresía" }).click();

    await expect(page.getByText("Escribe el nombre del cliente.")).toHaveCount(0);
    await expect(page.getByText(/solo puede llevar letras/)).toBeVisible();
    await expect(page).not.toHaveURL(/\/clientes\/MP-/);
  });
});
