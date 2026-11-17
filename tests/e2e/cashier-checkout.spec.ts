import { test } from "@playwright/test";
import { expect, gotoApp, openScanDialog, searchCard, summaryRow } from "./helpers";

test.use({ storageState: "tests/e2e/.auth/caja-aurora.json" });

/**
 * La rebanada de la demo, de punta a punta: buscar la tarjeta, teclear el monto,
 * ver el resumen que calcula `src/lib/pricing.ts` y registrar la compra contra el
 * API real.
 *
 * Laura Méndez (`MP-4F7K2`) es del seed y está en Oro: 15 % de descuento, 1 punto
 * por cada $10 y 3 % de cashback. Sobre $1,000 son $150 de descuento, $850 de
 * total, 85 puntos y $25.50 de cashback: los mismos números de la rúbrica que ya
 * prueba `tests/unit/test_pricing_service.py` en el backend.
 */
test.describe("Caja: compra completa", () => {
  test("registra $1,000 en Oro y muestra el comprobante", async ({ page }) => {
    await openScanDialog(page);
    await searchCard(page, "MP-4F7K2");
    await expect(page).toHaveURL(/\/caja\?code=MP-4F7K2/);

    await expect(page.getByRole("heading", { name: "Registrar compra", level: 1 })).toBeVisible();
    await page.getByLabel("Monto", { exact: true }).fill("1000");
    await page.getByLabel(/Concepto/).fill("Compra E2E");

    await expect(summaryRow(page, "Descuento")).toHaveText("−$150.00");
    await expect(summaryRow(page, "Total a cobrar")).toHaveText("$850.00");
    await expect(summaryRow(page, "Puntos que gana")).toHaveText("+85");
    await expect(summaryRow(page, "Cashback que gana")).toHaveText("+$25.50");

    await page.getByRole("button", { name: "Registrar compra" }).click();

    await expect(page).toHaveURL(/\/caja\/comprobante\/[\w-]+/);
    await expect(page.getByRole("heading", { name: "Compra registrada" })).toBeVisible();
    await expect(page.getByText("Cobrado a Laura Méndez")).toBeVisible();
    await expect(page.getByText("Compra E2E")).toBeVisible();
    await expect(page.getByText("$1,000.00").first()).toBeVisible();
    await expect(page.getByText("$850.00").first()).toBeVisible();
  });

  test("el monto no se puede registrar sin tarjeta", async ({ page }) => {
    await gotoApp(page, "/caja");

    await expect(page.getByLabel("Monto", { exact: true })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Registrar compra" })).toBeDisabled();
  });
});
