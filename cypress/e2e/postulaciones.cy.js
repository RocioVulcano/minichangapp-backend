// cypress/e2e/postulaciones.cy.js

describe('🔗 E2E - Postulaciones API', () => {
  let postulacionCreada;
  let usuarioEmpleado;
  let trabajoDisponible;

  before(() => {
    cy.crearUsuarioTest({ 
      nombre: 'Empleado Test', 
      rol: 'empleado',
      email: `empleado.${Date.now()}@test.com`
    }).then((usuario) => {
      usuarioEmpleado = usuario;
      cy.crearTrabajoTest({ 
        titulo: 'Trabajo para Postulaciones',
        empleador_id: 1
      }).then((trabajo) => {
        trabajoDisponible = trabajo;
      });
    });
  });

  after(() => {
    if (usuarioEmpleado?.id_usuario) {
      cy.eliminarUsuario(usuarioEmpleado.id_usuario);
    }
    if (trabajoDisponible?.id_trabajo) {
      cy.eliminarTrabajo(trabajoDisponible.id_trabajo);
    }
  });

  beforeEach(() => {
    cy.request(`${Cypress.env('apiUrl')}/postulaciones`).its('status').should('eq', 200);
  });

  afterEach(() => {
    if (postulacionCreada?.id_postulacion) {
      cy.eliminarPostulacion(postulacionCreada.id_postulacion);
      postulacionCreada = null;
    }
  });

  it('✅ Debería listar todas las postulaciones (GET /postulaciones)', () => {
    cy.request('GET', `${Cypress.env('apiUrl')}/postulaciones`)
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
  });

  it('✅ Debería crear una nueva postulación (POST /postulaciones)', () => {
    const nuevaPostulacion = {
      trabajo_id: trabajoDisponible?.id_trabajo || 1,
      usuario_id: usuarioEmpleado?.id_usuario || 1,
      mensaje: 'Estoy muy interesado en este trabajo',
      oferta_pago: 5000
    };

    cy.request('POST', `${Cypress.env('apiUrl')}/postulaciones`, nuevaPostulacion)
      .then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.be.an('array');
        expect(response.body[0]).to.have.property('id_postulacion');
        expect(response.body[0].mensaje).to.eq(nuevaPostulacion.mensaje);
        postulacionCreada = response.body[0];
      });
  });

  it('✅ Debería obtener una postulación por ID (GET /postulaciones/:id)', () => {
    cy.crearPostulacionTest({ 
      trabajo_id: trabajoDisponible?.id_trabajo || 1,
      usuario_id: usuarioEmpleado?.id_usuario || 1,
      mensaje: 'Postulación de prueba'
    }).then((postulacion) => {
      postulacionCreada = postulacion;
      cy.request('GET', `${Cypress.env('apiUrl')}/postulaciones/${postulacion.id_postulacion}`)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array');
          expect(response.body[0].id_postulacion).to.eq(postulacion.id_postulacion);
        });
    });
  });

  it('✅ Debería actualizar una postulación (PUT /postulaciones/:id)', () => {
    cy.crearPostulacionTest({ 
      trabajo_id: trabajoDisponible?.id_trabajo || 1,
      usuario_id: usuarioEmpleado?.id_usuario || 1,
      mensaje: 'Mensaje original'
    }).then((postulacion) => {
      postulacionCreada = postulacion;
      const datosActualizados = {
        mensaje: 'Mensaje actualizado',
        oferta_pago: 7000
      };

      cy.request('PUT', `${Cypress.env('apiUrl')}/postulaciones/${postulacion.id_postulacion}`, datosActualizados)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array');
          expect(response.body[0].mensaje).to.eq(datosActualizados.mensaje);
          expect(response.body[0].oferta_pago).to.eq(datosActualizados.oferta_pago);
        });
    });
  });

  it('✅ Debería eliminar una postulación (DELETE /postulaciones/:id)', () => {
    cy.crearPostulacionTest({ 
      trabajo_id: trabajoDisponible?.id_trabajo || 1,
      usuario_id: usuarioEmpleado?.id_usuario || 1,
      mensaje: 'Postulación a eliminar'
    }).then((postulacion) => {
      cy.request('DELETE', `${Cypress.env('apiUrl')}/postulaciones/${postulacion.id_postulacion}`)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.message).to.include('eliminada');
        });
    });
  });

  it('✅ Debería manejar diferentes ofertas de pago', () => {
    const ofertas = [3000, 5000, 10000];

    ofertas.forEach((oferta) => {
      cy.crearPostulacionTest({ 
        trabajo_id: trabajoDisponible?.id_trabajo || 1,
        usuario_id: usuarioEmpleado?.id_usuario || 1,
        mensaje: `Postulación oferta ${oferta}`,
        oferta_pago: oferta
      }).then((postulacion) => {
        expect(postulacion.oferta_pago).to.eq(oferta);
        cy.eliminarPostulacion(postulacion.id_postulacion);
      });
    });
  });
});