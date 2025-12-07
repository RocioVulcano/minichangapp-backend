// =========================
// CONFIG AUTOMÁTICA
// Detecta si el frontend está corriendo en QA o PROD según su dominio
// =========================

let API_URL = "";

// Si el dominio contiene "qa" → usar backend QA
if (window.location.hostname.includes("qa")) {
  API_URL = "https://changapp-qa-f2dkejh0dxeshbh4.canadacentral-01.azurewebsites.net";

// Sino → usar backend PROD
} else {
  API_URL = "https://changapp-prod-atcjfjgnbkhde0g2.canadacentral-01.azurewebsites.net";
}

// Exponer variable global
window.API_URL = API_URL;

console.log("🌐 API_URL seleccionada automáticamente:", API_URL);
