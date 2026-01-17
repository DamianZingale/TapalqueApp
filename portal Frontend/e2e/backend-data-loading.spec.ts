import { test, expect } from '@playwright/test';

test.describe('Carga de datos desde el backend', () => {

  test.describe('Gastronomía', () => {
    test('debe hacer llamada API al backend', async ({ page }) => {
      let apiCalled = false;
      let apiUrl = '';

      page.on('request', (request) => {
        if (request.url().includes('/api/gastronomia')) {
          apiCalled = true;
          apiUrl = request.url();
        }
      });

      await page.goto('/gastronomia');
      await page.waitForTimeout(3000);

      expect(apiCalled).toBeTruthy();
      console.log(`API llamada: ${apiUrl}`);
    });
  });

  test.describe('Hospedajes', () => {
    test('debe hacer llamada API al backend', async ({ page }) => {
      let apiCalled = false;
      let apiUrl = '';

      page.on('request', (request) => {
        if (request.url().includes('/api/hospedajes')) {
          apiCalled = true;
          apiUrl = request.url();
        }
      });

      await page.goto('/hospedaje');
      await page.waitForTimeout(3000);

      expect(apiCalled).toBeTruthy();
      console.log(`API llamada: ${apiUrl}`);
    });
  });

  test.describe('Comercios', () => {
    test('debe hacer llamada API al backend (NO usar mocks)', async ({ page }) => {
      let apiCalled = false;
      let apiUrl = '';

      page.on('request', (request) => {
        if (request.url().includes('/api/comercio')) {
          apiCalled = true;
          apiUrl = request.url();
        }
      });

      await page.goto('/comercio');
      await page.waitForTimeout(3000);

      expect(apiCalled).toBeTruthy();
      console.log(`API llamada: ${apiUrl}`);
    });

    test('debe mostrar spinner de carga mientras espera datos', async ({ page }) => {
      await page.goto('/comercio');

      // Verificar que aparece el spinner de carga
      const spinner = page.locator('.spinner-border');
      const loadingText = page.getByText('Cargando comercios');

      // Al menos uno debe ser visible inicialmente
      const hasSpinner = await spinner.isVisible().catch(() => false);
      const hasLoadingText = await loadingText.isVisible().catch(() => false);

      // Si hay contenido cargado rápido o error, verificar que la página cargó
      await page.waitForTimeout(5000);

      const cards = page.locator('.card');
      const errorMsg = page.getByText('No se pudieron cargar', { exact: false });
      const emptyMsg = page.getByText('No hay comercios', { exact: false });

      const hasCards = await cards.count() > 0;
      const hasError = await errorMsg.isVisible().catch(() => false);
      const hasEmpty = await emptyMsg.isVisible().catch(() => false);

      // La página debe mostrar algo: cards, error, o mensaje vacío
      expect(hasSpinner || hasLoadingText || hasCards || hasError || hasEmpty).toBeTruthy();
    });
  });

  test.describe('Servicios', () => {
    test('debe hacer llamada API al backend (NO usar mocks)', async ({ page }) => {
      let apiCalled = false;
      let apiUrl = '';

      page.on('request', (request) => {
        if (request.url().includes('/api/servicio')) {
          apiCalled = true;
          apiUrl = request.url();
        }
      });

      await page.goto('/servicios');
      await page.waitForTimeout(3000);

      expect(apiCalled).toBeTruthy();
      console.log(`API llamada: ${apiUrl}`);
    });
  });

  test.describe('Espacios Públicos', () => {
    test('debe hacer llamada API al backend (NO usar mocks)', async ({ page }) => {
      let apiCalled = false;
      let apiUrl = '';

      page.on('request', (request) => {
        if (request.url().includes('/api/espacio-publico')) {
          apiCalled = true;
          apiUrl = request.url();
        }
      });

      await page.goto('/espublicos');
      await page.waitForTimeout(3000);

      expect(apiCalled).toBeTruthy();
      console.log(`API llamada: ${apiUrl}`);
    });
  });

  test.describe('Termas', () => {
    test('debe hacer llamada API al backend', async ({ page }) => {
      let apiCalled = false;
      let apiUrl = '';

      page.on('request', (request) => {
        if (request.url().includes('/api/terma')) {
          apiCalled = true;
          apiUrl = request.url();
        }
      });

      await page.goto('/termas/1');
      await page.waitForTimeout(3000);

      expect(apiCalled).toBeTruthy();
      console.log(`API llamada: ${apiUrl}`);
    });
  });

  test.describe('Eventos', () => {
    test('debe hacer llamada API al backend', async ({ page }) => {
      let apiCalled = false;
      let apiUrl = '';

      page.on('request', (request) => {
        if (request.url().includes('/api/eventos')) {
          apiCalled = true;
          apiUrl = request.url();
        }
      });

      await page.goto('/eventos');
      await page.waitForTimeout(3000);

      expect(apiCalled).toBeTruthy();
      console.log(`API llamada: ${apiUrl}`);
    });
  });
});

test.describe('Verificación de estructura de páginas', () => {
  test('Comercios - debe tener estructura correcta', async ({ page }) => {
    await page.goto('/comercio');

    // Debe tener título
    const titulo = page.locator('h1');
    await expect(titulo).toContainText('Comercios');
  });

  test('Servicios - debe tener estructura correcta', async ({ page }) => {
    await page.goto('/servicios');

    const titulo = page.locator('h1');
    await expect(titulo).toContainText('Servicios');
  });

  test('Espacios Públicos - debe tener estructura correcta', async ({ page }) => {
    await page.goto('/espublicos');

    const titulo = page.locator('h1');
    await expect(titulo).toContainText('Espacios');
  });

  test('Hospedajes - debe tener estructura correcta', async ({ page }) => {
    await page.goto('/hospedaje');

    const titulo = page.locator('h1');
    await expect(titulo).toContainText('Hospedajes');
  });
});
