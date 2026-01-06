const { Builder, By, until } = require("selenium-webdriver");
const fs = require("fs");
require("chromedriver");

(async function clientesBusquedaTest() {
  const BASE_URL = process.env.E2E_BASE_URL || "https://proyecto-calidad-psi.vercel.app";
  const EMAIL = process.env.E2E_EMAIL;
  const PASSWORD = process.env.E2E_PASSWORD;

  if (!EMAIL || !PASSWORD) {
    console.error("Faltan variables E2E_EMAIL o E2E_PASSWORD");
    process.exit(1);
  }

  const driver = await new Builder().forBrowser("chrome").build();

  try {
    // 1) Login
    await driver.get(`${BASE_URL}/`);
    await driver.wait(until.elementLocated(By.id("email")), 15000);
    await driver.findElement(By.id("email")).sendKeys(EMAIL);
    await driver.findElement(By.id("password")).sendKeys(PASSWORD);
    await driver.findElement(By.css('button[type="submit"]')).click();

    // 2) Esperar dashboard
    await driver.wait(async () => (await driver.getCurrentUrl()).includes("/dashboard"), 20000);

    // 3) Esperar tabla y primera fila
    await driver.wait(until.elementLocated(By.css("table tbody tr")), 20000);
    const firstRow = await driver.findElement(By.css("table tbody tr"));

    // 4) Tomar keyword de columnas "Nombre/Empresa" (NO ID)
    const tds = await firstRow.findElements(By.css("td"));

    // Por tu tabla: [0]=ID, [1]=NOMBRE, [4]=EMPRESA (aprox)
    const candidates = [
      (await tds[1]?.getText())?.trim(), // NOMBRE
      (await tds[4]?.getText())?.trim(), // EMPRESA
      (await tds[2]?.getText())?.trim(), // NOMBRES (si aplica)
      (await tds[3]?.getText())?.trim(), // APELLIDOS (si aplica)
    ].filter(Boolean);

    // Elegir el primer candidato con letras (evita IDs o números)
    const keyword =
      candidates.find((c) => /[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(c) && c.length >= 3) ||
      "Juan"; // fallback si algo raro pasa

    // 5) Buscar por placeholder
    const searchInput = await driver.wait(
      until.elementLocated(By.css('input[placeholder*="Buscar por nombre"]')),
      15000
    );

    await searchInput.clear();
    await searchInput.sendKeys(keyword);

    // 6) Validar que al menos una fila contenga la keyword
    await driver.wait(async () => {
      const rows = await driver.findElements(By.css("table tbody tr"));
      if (rows.length === 0) return false;

      for (const r of rows) {
        const t = (await r.getText()).toLowerCase();
        if (t.includes(keyword.toLowerCase())) return true;
      }
      return false;
    }, 20000);

    // 7) Evidencia
    const png = await driver.takeScreenshot();
    fs.writeFileSync("evidencia-e2e-clientes-busqueda.png", png, "base64");

    console.log(`PRUEBA OK: Búsqueda de clientes funciona usando keyword="${keyword}"`);
    console.log("Evidencia guardada: evidencia-e2e-clientes-busqueda.png");
    process.exit(0);
  } catch (err) {
    try {
      const png = await driver.takeScreenshot();
      fs.writeFileSync("evidencia-e2e-clientes-busqueda-fallo.png", png, "base64");
      console.log("Evidencia de fallo: evidencia-e2e-clientes-busqueda-fallo.png");
    } catch {}
    console.error("PRUEBA FALLÓ:", err);
    process.exit(1);
  } finally {
    await driver.quit();
  }
})();