// cypress/e2e/performance.cy.js

describe('⚡ E2E - Performance y Carga', () => {
  
  describe('Tiempos de Respuesta', () => {
    it('✅ GET /usuarios debería responder en menos de 1 segundo', () => {
      const inicio = Date.now();
      
      cy.request('GET', `${Cypress.env('apiUrl')}/usuarios`)
        .then((response) => {
          const tiempo = Date.now() - inicio;
          expect(response.status).to.eq(200);
          expect(tiempo).to.be.lessThan(1000);
          cy.log(`⏱️ Tiempo de respuesta: ${tiempo}ms`);
        });
    });

    it('✅ POST /usuarios debería responder en menos de 2 segundos', () => {
      const inicio = Date.now();
      
      cy.crearUsuarioTest({
        nombre: 'Usuario Performance',
        email: `perf${Date.now()}@test.com`
      }).then((usuario) => {
        const tiempo = Date.now() - inicio;
        expect(tiempo).to.be.lessThan(2000);
        cy.log(`⏱️ Tiempo de creación: ${tiempo}ms`);
        cy.eliminarUsuario(usuario.id_usuario);
      });
    });

    it('✅ Múltiples requests deberían completarse en tiempo razonable', () => {
      const inicio = Date.now();
      const requests = [];

      for (let i = 0; i < 5; i++) {
        requests.push(
          cy.request('GET', `${Cypress.env('apiUrl')}/usuarios`)
        );
      }

      cy.wrap(Promise.all(requests)).then(() => {
        const tiempo = Date.now() - inicio;
        expect(tiempo).to.be.lessThan(5000);
        cy.log(`⏱️ 5 requests completadas en: ${tiempo}ms`);
      });
    });
  });

  describe('Creación Masiva', () => {
    const usuariosCreados = [];

    after(() => {
      usuariosCreados.forEach((id) => {
        cy.eliminarUsuario(id);
      });
    });

    it('✅ Crear 10 usuarios consecutivamente', () => {
      for (let i = 0; i < 10; i++) {
        cy.crearUsuarioTest({
          nombre: `UsuarioMasivo`,
          email: `masivo${i}.${Date.now()}@test.com`
        }).then((usuario) => {
          usuariosCreados.push(usuario.id_usuario);
          expect(usuario).to.have.property('id_usuario');
        });
      }

      cy.wrap(usuariosCreados).should('have.length', 10);
    });
  });

  describe('Consultas con Muchos Registros', () => {
    it('✅ GET /usuarios debería manejar respuestas grandes', () => {
      cy.request('GET', `${Cypress.env('apiUrl')}/usuarios`)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array');
          cy.log(`📊 Total de usuarios: ${response.body.length}`);
        });
    });

    it('✅ GET /trabajos debería manejar respuestas grandes', () => {
      cy.request('GET', `${Cypress.env('apiUrl')}/trabajos`)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array');
          cy.log(`📊 Total de trabajos: ${response.body.length}`);
        });
    });

    it('✅ GET /postulaciones debería manejar respuestas grandes', () => {
      cy.request('GET', `${Cypress.env('apiUrl')}/postulaciones`)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array');
          cy.log(`📊 Total de postulaciones: ${response.body.length}`);
        });
    });
  });
});