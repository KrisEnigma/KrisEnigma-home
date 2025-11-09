import { test, expect } from "@playwright/test";

test("bloquea bots (honeypot y tiempo)", async ({ page }) => {
  await page.goto("https://krisenigma.com");
  // Simular bot llenando honeypot
  await page.evaluate(() => {
    const el = document.querySelector('input[name="urltrap"]');
    if (el) (el as HTMLInputElement).value = "bot";
  });
  // Abrir modal y enviar rápido
  await page.evaluate(() => (window as any).openContact());
  await page.fill('input[name="name"]', "Bot");
  await page.fill('input[name="email"]', "bot@email.com");
  await page.selectOption('select[name="subject"]', "Preguntas");
  await page.fill('textarea[name="message"]', "Mensaje spam");
  await page.click('button[type="submit"]');
  // Esperar respuesta
  await page.waitForSelector("#thankyouMessage");
  const errorText = await page.textContent("#thankyouMessage");
  expect(errorText).toContain("Spam detectado");
});

test("permite envío válido", async ({ page }) => {
  await page.goto("https://krisenigma.com");
  await page.evaluate(() => (window as any).openContact());
  await page.fill('input[name="name"]', "Test User");
  await page.fill('input[name="email"]', "testuser@email.com");
  await page.selectOption('select[name="subject"]', "Preguntas");
  await page.fill('textarea[name="message"]', "Mensaje legítimo");
  // Esperar 4 segundos para pasar la validación de tiempo
  await page.waitForTimeout(4000);
  await page.click('button[type="submit"]');
  await page.waitForSelector("#thankyouMessage");
  const successText = await page.textContent("#thankyouMessage");
  expect(successText).toContain("¡Gracias por tu mensaje!");
});
