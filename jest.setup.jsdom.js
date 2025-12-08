// jest.setup.jsdom.js
// Archivo de configuración para pruebas de frontend con jsdom

// Suprimir warnings de jsdom sobre navegación
const originalConsoleError = console.error;
console.error = (...args) => {
  // Ignorar warnings específicos de jsdom sobre navegación
  if (
    args[0]?.toString().includes('Not implemented: navigation') ||
    args[0]?.toString().includes('Not implemented: HTMLFormElement.prototype.submit')
  ) {
    return;
  }
  originalConsoleError(...args);
};

// NO intentar redefinir window.location - jsdom ya lo maneja
// Solo mockear las funciones que necesitamos si no existen
if (typeof window !== 'undefined' && window.location) {
  // Si location.reload no existe o no es una función, mockearlo
  if (typeof window.location.reload !== 'function') {
    window.location.reload = jest.fn();
  }
}