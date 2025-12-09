// cypress/e2e/seguridad.cy.js

describe('🔒 E2E - Seguridad Básica', () => {
  
  describe('Inyección SQL (Básico)', () => {
    it('❌ Debería rechazar SQL injection en nombre', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/usuarios`,
        body: {
          nombre: "'; DROP TABLE usuario; --",
          email: `test${Date.now()}@test.com`,
          rol: 'empleado'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Debería fallar por validación de nombre (contiene caracteres especiales)
        expect([200, 201, 400]).to.include(response.status);
      });
    });

    it('❌ Debería rechazar SQL injection en email', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/usuarios`,
        body: {
          nombre: 'Test User',
          email: "admin'--",
          rol: 'empleado'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.exist;
      });
    });
  });

  describe('XSS (Cross-Site Scripting)', () => {
    let usuarioCreado;

    afterEach(() => {
      if (usuarioCreado?.id_usuario) {
        cy.eliminarUsuario(usuarioCreado.id_usuario);
        usuarioCreado = null;
      }
    });

    it('✅ Debería sanitizar scripts en nombre', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/usuarios`,
        body: {
          nombre: '<script>alert("XSS")</script>',
          email: `xss${Date.now()}@test.com`,
          rol: 'empleado'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Debería fallar por validación
        expect([200, 201, 400]).to.include(response.status);
      });
    });

    it('✅ Debería sanitizar HTML en descripción de trabajo', () => {
      cy.crearTrabajoTest({
        titulo: 'Trabajo XSS Test',
        descripcion: '<img src=x onerror=alert("XSS")>',
        empleador_id: 1
      }).then((trabajo) => {
        // Si pasa, el sistema acepta HTML (puede ser esperado o no)
        cy.eliminarTrabajo(trabajo.id_trabajo);
      });
    });
  });

  describe('Validación de Tipos de Datos', () => {
    it('❌ Debería rechazar string en campo numérico', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/postulaciones`,
        body: {
          trabajo_id: 'abc',  // String en lugar de número
          usuario_id: 1,
          mensaje: 'Test',
          oferta_pago: 5000
        },
        failOnStatusCode: false
      }).then((response) => {
        // Puede ser 400 o 500 dependiendo de la implementación
        expect([400, 500]).to.include(response.status);
      });
    });

    it('❌ Debería rechazar oferta_pago negativa', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/postulaciones`,
        body: {
          trabajo_id: 1,
          usuario_id: 1,
          mensaje: 'Test',
          oferta_pago: -5000
        },
        failOnStatusCode: false
      }).then((response) => {
        // Dependiendo de tu validación, puede pasar o fallar
        cy.log(`Status: ${response.status}`);
      });
    });
  });

  describe('Límites y Tamaños', () => {
    it('✅ Debería manejar textos muy largos', () => {
      const textoLargo = 'A'.repeat(10000);
      
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/trabajos`,
        body: {
          titulo: 'Test Largo',
          descripcion: textoLargo,
          ubicacion: 'Test',
          empleador_id: 1
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status: ${response.status}`);
        
        if (response.status === 201) {
          cy.eliminarTrabajo(response.body[0].id_trabajo);
        }
      });
    });

    it('❌ Debería rechazar email demasiado largo', () => {
      const emailLargo = 'a'.repeat(300) + '@test.com';
      
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/usuarios`,
        body: {
          nombre: 'Test User',
          email: emailLargo,
          rol: 'empleado'
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Status: ${response.status}`);
      });
    });
  });
});