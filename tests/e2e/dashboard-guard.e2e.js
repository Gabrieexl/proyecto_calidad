const { Builder, until } = require("selenium-webdriver");
require("chromedriver");

(async function dashboardGuardTest() {
  const BASE_URL = process.env.E2E_BASE_URL || "https://proyecto-calidad-psi.vercel.app";
  const LOGIN_PATHS = ["/", "/login"]; 

  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get(BASE_URL);

    await driver.manage().deleteAllCookies();
    await driver.executeScript("window.localStorage.clear(); window.sessionStorage.clear();");

    await driver.get(`${BASE_URL}/dashboard`);

    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();

      const redirectedToLogin = LOGIN_PATHS.some((p) => url.includes(p)) && !url.includes("/dashboard");
      if (redirectedToLogin) return true;


      const hasEmail = await driver.executeScript(
        "return !!document.querySelector('#email')"
      );
      const hasPassword = await driver.executeScript(
        "return !!document.querySelector('#password')"
      );
      return Boolean(hasEmail && hasPassword);
    }, 20000);

    const finalUrl = await driver.getCurrentUrl();
    console.log("PRUEBA OK: Ruta protegida. Sin sesión NO permite /dashboard.");
    console.log("   URL final:", finalUrl);

    process.exit(0);
  } catch (err) {
    console.error("PRUEBA FALLÓ: Se pudo acceder a /dashboard sin sesión o no redirigió correctamente.");
    console.error(err);
    process.exit(1);
  } finally {
    await driver.quit();
  }
})();
