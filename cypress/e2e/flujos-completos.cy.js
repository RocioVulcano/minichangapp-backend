// cypress/e2e/flujos-completos.cy.js

describe('🔄 E2E - Flujos Completos', () => {
  
  describe('Flujo: Empleador publica trabajo y recibe postulaciones', () => {
    let empleador, candidato1, candidato2, trabajo;

    before(() => {
      // Crear empleador
      cy.crearUsuarioTest({
        nombre: 'Empleador Flow',
        email: `empleador.flow.${Date.now()}@test.com`,
        rol: 'empleador'
      }).then((usuario) => {
        empleador = usuario;
      });

      // Crear candidatos
      cy.crearUsuarioTest({
        nombre: 'Candidato Uno',
        email: `candidato1.${Date.now()}@test.com`,
        rol: 'empleado'
      }).then((usuario) => {
        candidato1 = usuario;
      });

      cy.crearUsuarioTest({
        nombre: 'Candidato Dos',
        email: `candidato2.${Date.now()}@test.com`,
        rol: 'empleado'
      }).then((usuario) => {
        candidato2 = usuario;
      });
    });

    after(() => {
      // Eliminar todas las postulaciones asociadas al trabajo
      if (trabajo?.id_trabajo) {
        cy.request('GET', `${Cypress.env('apiUrl')}/postulaciones`).then((res) => {
          res.body
            .filter(p => p.trabajo_id === trabajo.id_trabajo)
            .forEach(p => cy.eliminarPostulacion(p.id_postulacion));
        });
      }

      if (trabajo?.id_trabajo) cy.eliminarTrabajo(trabajo.id_trabajo);
      if (empleador?.id_usuario) cy.eliminarUsuario(empleador.id_usuario);
      if (candidato1?.id_usuario) cy.eliminarUsuario(candidato1.id_usuario);
      if (candidato2?.id_usuario) cy.eliminarUsuario(candidato2.id_usuario);
    });

    it('✅ Paso 1: Empleador publica trabajo', () => {
      cy.crearTrabajoTest({
        titulo: 'Desarrollador Full Stack',
        descripcion: 'Buscamos desarrollador con experiencia',
        ubicacion: 'Córdoba Capital',
        empleador_id: empleador.id_usuario
      }).then((trabajoCreado) => {
        trabajo = trabajoCreado;
        expect(trabajo.empleador_id).to.eq(empleador.id_usuario);
      });
    });

    it('✅ Paso 2: Candidato 1 postula al trabajo', () => {
      cy.crearPostulacionTest({
        trabajo_id: trabajo.id_trabajo,
        usuario_id: candidato1.id_usuario,
        mensaje: 'Tengo 5 años de experiencia',
        oferta_pago: 50000
      }).then((postulacion) => {
        expect(postulacion.trabajo_id).to.eq(trabajo.id_trabajo);
        expect(postulacion.usuario_id).to.eq(candidato1.id_usuario);
      });
    });

    it('✅ Paso 3: Candidato 2 postula al mismo trabajo', () => {
      cy.crearPostulacionTest({
        trabajo_id: trabajo.id_trabajo,
        usuario_id: candidato2.id_usuario,
        mensaje: 'Soy especialista en Node.js',
        oferta_pago: 45000
      }).then((postulacion) => {
        expect(postulacion.trabajo_id).to.eq(trabajo.id_trabajo);
        expect(postulacion.usuario_id).to.eq(candidato2.id_usuario);
      });
    });

    it('✅ Paso 4: Verificar que el trabajo tiene postulaciones', () => {
      cy.request('GET', `${Cypress.env('apiUrl')}/postulaciones`)
        .then((response) => {
          const postulacionesDelTrabajo = response.body.filter(
            p => p.trabajo_id === trabajo.id_trabajo
          );
          expect(postulacionesDelTrabajo.length).to.be.greaterThan(0);
        });
    });
  });

  describe('Flujo: Actualización en cadena', () => {
    let usuario, trabajo, postulacion;

    before(() => {
      cy.crearUsuarioTest({
        nombre: 'Usuario Cadena',
        email: `cadena${Date.now()}@test.com`
      }).then((u) => {
        usuario = u;
        
        cy.crearTrabajoTest({
          titulo: 'Trabajo Cadena',
          empleador_id: usuario.id_usuario
        }).then((t) => {
          trabajo = t;
          
          cy.crearPostulacionTest({
            trabajo_id: trabajo.id_trabajo,
            usuario_id: usuario.id_usuario,
            mensaje: 'Postulación inicial'
          }).then((p) => {
            postulacion = p;
          });
        });
      });
    });

    after(() => {
      if (postulacion?.id_postulacion) cy.eliminarPostulacion(postulacion.id_postulacion);
      if (trabajo?.id_trabajo) cy.eliminarTrabajo(trabajo.id_trabajo);
      if (usuario?.id_usuario) cy.eliminarUsuario(usuario.id_usuario);
    });

    it('✅ Actualizar usuario y verificar cambios', () => {
      cy.request('PUT', `${Cypress.env('apiUrl')}/usuarios/${usuario.id_usuario}`, {
        nombre: 'Usuario Actualizado',
        email: usuario.email,
        rol: 'empleador'
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body[0].nombre).to.eq('Usuario Actualizado');
      });
    });

    it('✅ Actualizar trabajo y verificar cambios', () => {
      cy.request('PUT', `${Cypress.env('apiUrl')}/trabajos/${trabajo.id_trabajo}`, {
        titulo: 'Trabajo Actualizado',
        descripcion: 'Nueva descripción',
        ubicacion: trabajo.ubicacion
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body[0].titulo).to.eq('Trabajo Actualizado');
      });
    });

    it('✅ Actualizar postulación y verificar cambios', () => {
      cy.request('PUT', `${Cypress.env('apiUrl')}/postulaciones/${postulacion.id_postulacion}`, {
        mensaje: 'Mensaje actualizado',
        oferta_pago: 60000
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body[0].mensaje).to.eq('Mensaje actualizado');
        expect(response.body[0].oferta_pago).to.eq(60000);
      });
    });
  });

  describe('Flujo: Eliminar usuario con trabajos y postulaciones', () => {
    let empleador, trabajo1, trabajo2;

    beforeEach(() => {
      cy.crearUsuarioTest({
        nombre: 'Empleador con Trabajos',
        email: `empleador.trabajos.${Date.now()}@test.com`,
        rol: 'empleador'
      }).then((usuario) => {
        empleador = usuario;
        
        cy.crearTrabajoTest({
          titulo: 'Trabajo 1',
          empleador_id: empleador.id_usuario
        }).then((t) => {
          trabajo1 = t;
        });

        cy.crearTrabajoTest({
          titulo: 'Trabajo 2',
          empleador_id: empleador.id_usuario
        }).then((t) => {
          trabajo2 = t;
        });
      });
    });

    afterEach(() => {
      if (trabajo1?.id_trabajo) cy.eliminarTrabajo(trabajo1.id_trabajo);
      if (trabajo2?.id_trabajo) cy.eliminarTrabajo(trabajo2.id_trabajo);
      if (empleador?.id_usuario) cy.eliminarUsuario(empleador.id_usuario);
    });

    it('✅ Eliminar trabajos primero, luego usuario', () => {
      cy.request('DELETE', `${Cypress.env('apiUrl')}/trabajos/${trabajo1.id_trabajo}`)
        .its('status').should('eq', 200);
      
      cy.request('DELETE', `${Cypress.env('apiUrl')}/trabajos/${trabajo2.id_trabajo}`)
        .its('status').should('eq', 200);

      cy.request('DELETE', `${Cypress.env('apiUrl')}/usuarios/${empleador.id_usuario}`)
        .its('status').should('eq', 200);
    });
  });
});
