import { test } from "@playwright/test";
import { awaitSession, demoUsers, expect, login } from "./helpers";

/**
 * La tarjeta pública es la única pantalla que abre sin sesión, y es lo que el
 * cliente guarda en su teléfono: si se rompe, la entrega de la tarjeta queda en
 * blanco y nadie lo nota hasta la demo.
 *
 * El enlace se genera desde la ficha (acción de servidor) y viaja en el QR, así
 * que se copia con el botón «Copiar enlace»; después se abre en un contexto
 * nuevo, sin cookies de sesión, que es lo que hace el cliente.
 */
test.use({ permissions: ["clipboard-read", "clipboard-write"] });

test.describe("Tarjeta pública", () => {
  test("el enlace de la tarjeta abre sin sesión y muestra al cliente", async ({ page, browser }) => {
    await login(page, demoUsers.adminCafeAurora.email);
    await awaitSession(page);
    await page.goto("/clientes/MP-4F7K2");

    await page.getByRole("button", { name: "Entregar tarjeta" }).click();
    await page.getByRole("button", { name: "Generar enlace" }).click();
    await expect(
      page.getByRole("img", { name: "Código QR del enlace de la tarjeta" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Copiar enlace" }).click();
    const cardUrl = await page.evaluate(() => navigator.clipboard.readText());
    expect(cardUrl).toContain("/tarjeta/");

    const anonymous = await browser.newContext();
    const card = await anonymous.newPage();
    await card.goto(cardUrl);

    await expect(card.getByRole("heading", { name: "Tu tarjeta de Café Aurora" })).toBeVisible();
    await expect(card.getByText("Laura Méndez")).toBeVisible();
    await expect(card.getByText(/MP-4F7K2/)).toBeVisible();
    await expect(card.getByText(/Vigente hasta/)).toBeVisible();
    await expect(card.getByRole("button", { name: "Descargar imagen" })).toBeVisible();
    await expect(card.getByRole("button", { name: "Descargar PDF" })).toBeVisible();

    await anonymous.close();
  });

  test("sin enlace válido la tarjeta no existe", async ({ page }) => {
    await page.goto("/tarjeta/no-existe");

    await expect(page.getByRole("heading", { name: "Este enlace no funciona" })).toBeVisible();
    await expect(page.getByText(/Puede que haya vencido o que se haya generado uno nuevo/)).toBeVisible();
  });
});
