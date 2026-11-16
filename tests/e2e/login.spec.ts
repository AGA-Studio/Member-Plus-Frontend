import { test } from "@playwright/test";
import { demoUsers, expect, login, throwawayEmail } from "./helpers";

/**
 * El nombre del negocio vive en la tarjeta del sidebar: visible en escritorio,
 * oculta en la barra inferior del celular. Por eso se comprueba que exista
 * (attached) y no que se vea, así la misma prueba sirve en los dos proyectos.
 */
test.describe("Inicio de sesión", () => {
  test("el administrador de Café Aurora entra a su panel", async ({ page }) => {
    await login(page, demoUsers.adminCafeAurora.email);

    await expect(page).toHaveURL(/\/clientes/);
    await expect(page.getByRole("heading", { name: "Clientes", level: 1 })).toBeVisible();
    await expect(page.getByText(demoUsers.adminCafeAurora.business).first()).toBeAttached();
  });

  test("el empleado de caja entra al punto de cobro", async ({ page }) => {
    await login(page, demoUsers.cajaCafeAurora.email);

    await expect(page).toHaveURL(/\/caja/);
    await expect(page.getByText(demoUsers.cajaCafeAurora.business).first()).toBeAttached();
  });

  test("una contraseña incorrecta muestra el error y no deja entrar", async ({ page }) => {
    // Correo desechable: el API bloquea 15 minutos cualquier correo con 5 fallos.
    await login(page, throwawayEmail(), "no-es-la-contrasena");

    await expect(page.getByText("Correo o contraseña incorrectos. Revisa tus datos.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("el administrador de Gimnasio Titán no ve nada de Café Aurora", async ({ page }) => {
    await login(page, demoUsers.adminGimnasio.email);

    await expect(page).toHaveURL(/\/clientes/);
    await expect(page.getByText(demoUsers.adminGimnasio.business).first()).toBeAttached();
    await expect(page.getByText(demoUsers.adminCafeAurora.business)).toHaveCount(0);
  });
});
