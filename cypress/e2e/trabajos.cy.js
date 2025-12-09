// cypress/e2e/trabajos.cy.js

describe('🔗 E2E - Trabajos API', () => {
  let trabajoCreado;
  let usuarioEmpleador;

  before(() => {
    cy.crearUsuarioTest({ 
      nombre: 'Empleador Test', 
      rol: 'empleador',
      email: `empleador.${Date.now()}@test.com`
    }).then((usuario) => {
      usuarioEmpleador = usuario;
    });
  });

  after(() => {
    if (usuarioEmpleador?.id_usuario) {
      cy.eliminarUsuario(usuarioEmpleador.id_usuario);
    }
  });

  beforeEach(() => {
    cy.request(`${Cypress.env('apiUrl')}/trabajos`).its('status').should('eq', 200);
  });

  afterEach(() => {
    if (trabajoCreado?.id_trabajo) {
      cy.eliminarTrabajo(trabajoCreado.id_trabajo);
      trabajoCreado = null;
    }
  });

  it('✅ Debería listar todos los trabajos (GET /trabajos)', () => {
    cy.request('GET', `${Cypress.env('apiUrl')}/trabajos`)
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
  });

  it('✅ Debería crear un nuevo trabajo (POST /trabajos)', () => {
    const nuevoTrabajo = {
      titulo: 'Limpieza de oficina',
      descripcion: 'Se necesita limpieza profunda',
      ubicacion: 'Córdoba Capital',
      empleador_id: usuarioEmpleador?.id_usuario || 1
    };

    cy.request('POST', `${Cypress.env('apiUrl')}/trabajos`, nuevoTrabajo)
      .then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.be.an('array');
        expect(response.body[0]).to.have.property('id_trabajo');
        expect(response.body[0].titulo).to.eq(nuevoTrabajo.titulo);
        trabajoCreado = response.body[0];
      });
  });

  it('✅ Debería obtener un trabajo por ID (GET /trabajos/:id)', () => {
    cy.crearTrabajoTest({ 
      titulo: 'Jardinería', 
      empleador_id: usuarioEmpleador?.id_usuario || 1 
    }).then((trabajo) => {
      trabajoCreado = trabajo;
      cy.request('GET', `${Cypress.env('apiUrl')}/trabajos/${trabajo.id_trabajo}`)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array');
          expect(response.body[0].id_trabajo).to.eq(trabajo.id_trabajo);
        });
    });
  });

  it('✅ Debería actualizar un trabajo (PUT /trabajos/:id)', () => {
    cy.crearTrabajoTest({ 
      titulo: 'Trabajo Original',
      empleador_id: usuarioEmpleador?.id_usuario || 1
    }).then((trabajo) => {
      trabajoCreado = trabajo;
      const datosActualizados = {
        titulo: 'Trabajo Actualizado',
        descripcion: 'Descripción actualizada'
      };

      cy.request('PUT', `${Cypress.env('apiUrl')}/trabajos/${trabajo.id_trabajo}`, datosActualizados)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array');
          expect(response.body[0].titulo).to.eq(datosActualizados.titulo);
        });
    });
  });

  it('✅ Debería eliminar un trabajo (DELETE /trabajos/:id)', () => {
    cy.crearTrabajoTest({ 
      titulo: 'Trabajo a Eliminar',
      empleador_id: usuarioEmpleador?.id_usuario || 1
    }).then((trabajo) => {
      cy.request('DELETE', `${Cypress.env('apiUrl')}/trabajos/${trabajo.id_trabajo}`)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.message).to.include('eliminado');
        });
    });
  });

  it('✅ Debería filtrar trabajos por ubicación', () => {
    cy.crearTrabajoTest({ 
      titulo: 'Trabajo en Córdoba',
      ubicacion: 'Córdoba Capital',
      empleador_id: usuarioEmpleador?.id_usuario || 1
    }).then((trabajo) => {
      trabajoCreado = trabajo;
      cy.request('GET', `${Cypress.env('apiUrl')}/trabajos`)
        .then((response) => {
          expect(response.status).to.eq(200);
          const trabajosEnCordoba = response.body.filter(t => t.ubicacion === 'Córdoba Capital');
          expect(trabajosEnCordoba.length).to.be.greaterThan(0);
        });
    });
  });
});