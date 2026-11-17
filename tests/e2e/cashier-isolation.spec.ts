import { test } from "@playwright/test";
import { expect, gotoApp, openScanDialog, searchCard } from "./helpers";

test.use({ storageState: "tests/e2e/.auth/caja-aurora.json" });

/**
 * El aislamiento multi-negocio en el punto donde más fácil se rompe: la caja
 * teclea códigos de tarjeta, así que un `negocio_id` mal filtrado en
 * `/customer/lookup` dejaría cobrar a clientes de otro negocio.
 *
 * Roberto Díaz (`MP-3GYM4`) es de Gimnasio Titán; el cajero es de Café Aurora.
 */
test.describe("Caja: aislamiento", () => {
  test("el cajero no encuentra la tarjeta de otro negocio", async ({ page }) => {

    await openScanDialog(page);
    await searchCard(page, "MP-3GYM4");

    await expect(page.getByText("No encontramos esa tarjeta. Revisa el código.")).toBeVisible();
    await expect(page.getByText("Roberto Díaz")).toHaveCount(0);
    await expect(page).not.toHaveURL(/code=/);
  });

  test("entrar directo con el código de otro negocio tampoco lo carga", async ({ page }) => {

    await gotoApp(page, "/caja?code=MP-3GYM4");

    await expect(page.getByText("No encontramos esa tarjeta. Escanéala de nuevo.")).toBeVisible();
    await expect(page.getByText("Roberto Díaz")).toHaveCount(0);
    await expect(page.getByLabel("Monto", { exact: true })).toBeDisabled();
  });
});
