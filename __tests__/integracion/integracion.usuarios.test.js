import request from 'supertest';
import app from "../../app.js";

describe('🔗 Pruebas de integración - Usuarios', () => {
  let usuarioCreado;

  it('✅ Debería crear un nuevo usuario', async () => {
    const response = await request(app)
      .post('/usuarios')
      .send({
        nombre: 'Rocio Vulcano',
        email: 'rocio@test.com',
        rol: 'empleado',
      });

    console.log('Respuesta del servidor:', response.body);

    expect(response.statusCode).toBe(201);

    // Como Supabase devuelve un array con 1 objeto
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('id_usuario');

    usuarioCreado = response.body[0]; // 👈 guardamos el primer objeto del array
  });

  it('✅ Debería obtener el usuario creado', async () => {
    const response = await request(app).get('/usuarios');
    expect(response.statusCode).toBe(200);

    // Buscar si el usuario recién creado está en la lista
    const encontrado = response.body.find(u => u.id_usuario === usuarioCreado.id_usuario);
    expect(encontrado).toBeDefined();
    expect(encontrado.email).toBe('rocio@test.com');
  });

  it('✅ Debería actualizar el usuario', async () => {
    const response = await request(app)
      .put(`/usuarios/${usuarioCreado.id_usuario}`)
      .send({ nombre: 'Rocio Actualizada' });
    expect(response.statusCode).toBe(200);
    expect(response.body[0].nombre).toBe('Rocio Actualizada');
  });

  it('✅ Debería eliminar el usuario', async () => {
    const response = await request(app).delete(`/usuarios/${usuarioCreado.id_usuario}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Usuario eliminado correctamente');
  });
});