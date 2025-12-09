import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',  // ← CAMBIO: usar variable de entorno
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      apiUrl: process.env.CYPRESS_API_URL || 'http://localhost:3000'  // ← CAMBIO: usar variable de entorno
    },
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    reporter: 'junit',  // ← NUEVO: para reportes en Azure
    reporterOptions: {  // ← NUEVO: configuración de reportes
      mochaFile: 'cypress/results/results-[hash].xml',
      toConsole: true
    }
  }
});