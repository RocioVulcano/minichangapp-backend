// cypress/e2e/usuarios.cy.js

describe('🔗 E2E - Usuarios API', () => {
  let usuarioCreado;

  beforeEach(() => {
    cy.request(`${Cypress.env('apiUrl')}/usuarios`).its('status').should('eq', 200);
  });

  afterEach(() => {
    if (usuarioCreado?.id_usuario) {
      cy.eliminarUsuario(usuarioCreado.id_usuario);
    }
  });

  it('✅ Debería listar todos los usuarios (GET /usuarios)', () => {
    cy.request('GET', `${Cypress.env('apiUrl')}/usuarios`)
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
  });

  it('✅ Debería crear un nuevo usuario (POST /usuarios)', () => {
    const nuevoUsuario = {
      nombre: 'Juan Pérez',
      email: `juan.perez.${Date.now()}@test.com`,
      rol: 'empleado'
    };

    cy.request('POST', `${Cypress.env('apiUrl')}/usuarios`, nuevoUsuario)
      .then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.be.an('array');
        expect(response.body[0]).to.have.property('id_usuario');
        expect(response.body[0].nombre).to.eq(nuevoUsuario.nombre);
        expect(response.body[0].email).to.eq(nuevoUsuario.email);
        usuarioCreado = response.body[0];
      });
  });

  it('✅ Debería obtener un usuario por ID (GET /usuarios/:id)', () => {
    cy.crearUsuarioTest({ nombre: 'María Test', rol: 'empleador' })
      .then((usuario) => {
        usuarioCreado = usuario;
        cy.request('GET', `${Cypress.env('apiUrl')}/usuarios/${usuario.id_usuario}`)
          .then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
            expect(response.body[0].id_usuario).to.eq(usuario.id_usuario);
          });
      });
  });

  it('✅ Debería actualizar un usuario (PUT /usuarios/:id)', () => {
    cy.crearUsuarioTest({ nombre: 'Pedro Original' })
      .then((usuario) => {
        usuarioCreado = usuario;
        const datosActualizados = {
          nombre: 'Pedro Actualizado',
          email: `pedro.actualizado.${Date.now()}@test.com`,
          rol: 'empleador'
        };

        cy.request('PUT', `${Cypress.env('apiUrl')}/usuarios/${usuario.id_usuario}`, datosActualizados)
          .then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
            expect(response.body[0].nombre).to.eq(datosActualizados.nombre);
          });
      });
  });

  it('✅ Debería eliminar un usuario (DELETE /usuarios/:id)', () => {
    cy.crearUsuarioTest({ nombre: 'Usuario a Eliminar' })
      .then((usuario) => {
        cy.request('DELETE', `${Cypress.env('apiUrl')}/usuarios/${usuario.id_usuario}`)
          .then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.message).to.include('eliminado');
          });
      });
  });

  it('✅ Debería manejar usuarios con roles diferentes', () => {
    const roles = ['empleado', 'empleador'];

    roles.forEach((rol, index) => {
      cy.crearUsuarioTest({ 
        nombre: `Usuario ${rol}`, 
        email: `usuario.${rol}.${Date.now()}.${index}@test.com`,
        rol: rol 
      }).then((usuario) => {
        expect(usuario.rol).to.eq(rol);
        cy.eliminarUsuario(usuario.id_usuario);
      });
    });
  });
});