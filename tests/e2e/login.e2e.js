const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

(async function loginTest() {
  // URL de producción (tu Vercel)
  const BASE_URL = process.env.E2E_BASE_URL || "https://proyecto-calidad-psi.vercel.app";

  const EMAIL = process.env.E2E_EMAIL;
  const PASSWORD = process.env.E2E_PASSWORD;

  if (!EMAIL || !PASSWORD) {
    process.exit(1);
  }

  const driver = await new Builder().forBrowser("chrome").build();

  try {
    // 1) Abrir login
    await driver.get(`${BASE_URL}/`);

    // 2) Esperar inputs
    const emailInput = await driver.wait(until.elementLocated(By.id("email")), 15000);
    const passInput = await driver.wait(until.elementLocated(By.id("password")), 15000);


    await emailInput.clear();
    await emailInput.sendKeys(EMAIL);

    await passInput.clear();
    await passInput.sendKeys(PASSWORD);


    const btn = await driver.findElement(By.css('button[type="submit"]'));
    await btn.click();


    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes("/dashboard");
    }, 20000);

    process.exit(0);
  } catch (err) {
    process.exit(1);
  } finally {
    await driver.quit();
  }
})();
