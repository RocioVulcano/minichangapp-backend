// cypress/support/commands.js

// ***********************************************
// Custom commands para pruebas de API
// ***********************************************

// Comando para crear un usuario de prueba
Cypress.Commands.add('crearUsuarioTest', (usuario = {}) => {
  const usuarioDefault = {
    nombre: 'Test User',
    email: `test${Date.now()}@example.com`,
    rol: 'empleado',
    ...usuario
  };

  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/usuarios`,
    body: usuarioDefault
  }).then((response) => {
    expect(response.status).to.eq(201);
    expect(response.body).to.be.an('array');
    return response.body[0];
  });
});

// Comando para crear un trabajo de prueba
Cypress.Commands.add('crearTrabajoTest', (trabajo = {}) => {
  const trabajoDefault = {
    titulo: 'Trabajo de prueba',
    descripcion: 'Descripción de prueba',
    ubicacion: 'Córdoba',
    empleador_id: 1,
    ...trabajo
  };

  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/trabajos`,
    body: trabajoDefault
  }).then((response) => {
    expect(response.status).to.eq(201);
    expect(response.body).to.be.an('array');
    return response.body[0];
  });
});

// Comando para crear una postulación de prueba
Cypress.Commands.add('crearPostulacionTest', (postulacion = {}) => {
  const postulacionDefault = {
    trabajo_id: 1,
    usuario_id: 1,
    mensaje: 'Mensaje de prueba',
    oferta_pago: 5000,
    ...postulacion
  };

  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/postulaciones`,
    body: postulacionDefault
  }).then((response) => {
    expect(response.status).to.eq(201);
    expect(response.body).to.be.an('array');
    return response.body[0];
  });
});

// Comando para limpiar un usuario de prueba
Cypress.Commands.add('eliminarUsuario', (id) => {
  return cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/usuarios/${id}`,
    failOnStatusCode: false
  });
});

// Comando para limpiar un trabajo de prueba
Cypress.Commands.add('eliminarTrabajo', (id) => {
  return cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/trabajos/${id}`,
    failOnStatusCode: false
  });
});

// Comando para limpiar una postulación de prueba
Cypress.Commands.add('eliminarPostulacion', (id) => {
  return cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/postulaciones/${id}`,
    failOnStatusCode: false
  });
});