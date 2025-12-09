// cypress/e2e/health.cy.js

describe('🏥 E2E - Health Checks', () => {
  
  it('✅ GET / debería retornar página de bienvenida', () => {
    cy.request('GET', Cypress.env('apiUrl'))
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.include('MiniChangApp');
      });
  });

  it('✅ GET /health debería retornar status OK', () => {
    cy.request('GET', `${Cypress.env('apiUrl')}/health`)
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('status');
        expect(response.body.status).to.eq('ok');
      });
  });

  it('✅ Todos los endpoints principales deberían estar disponibles', () => {
    const endpoints = [
      '/usuarios',
      '/trabajos',
      '/postulaciones'
    ];

    endpoints.forEach((endpoint) => {
      cy.request('GET', `${Cypress.env('apiUrl')}${endpoint}`)
        .then((response) => {
          expect(response.status).to.eq(200);
          cy.log(`✅ ${endpoint} está disponible`);
        });
    });
  });

  it('❌ Endpoint inexistente debería retornar 404', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/endpoint-que-no-existe`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
});