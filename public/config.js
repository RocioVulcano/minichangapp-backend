// =========================
// CONFIG AUTOMÁTICA
// Detecta si estás en QA o en PROD
// =========================

let API_URL = "";

// 1) Detectar si la URL del frontend contiene "qa"
if (window.location.hostname.includes("qa")) {
  API_URL = "https://minichang-backend-qa.onrender.com";

// 2) Si no contiene "qa" → damos por hecho que es producción
} else {
  API_URL = "https://minichang-backend-prod.onrender.com";
}

// Exponer variable global (para el resto del front)
window.API_URL = API_URL;

console.log("🌐 API_URL seleccionada automáticamente:", API_URL);
