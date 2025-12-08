jest.mock("open", () => jest.fn());

import request from "supertest";
import app from "../../app.js";

// Mock de Supabase
let mockFrom;

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((table) => {
      return mockFrom ? mockFrom() : {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [{ id_usuario: 1, nombre: "Usuario Actualizado", email: "actualizado@test.com", rol: "empleado" }],
          error: null,
        }),
      };
    }),
  })),
}));

describe("PUT /usuarios/:id - Actualizar usuario", () => {
  beforeEach(() => {
    // Resetear mockFrom antes de cada test
    mockFrom = jest.fn(() => ({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id_usuario: 1, nombre: "Usuario Actualizado", email: "actualizado@test.com", rol: "empleado" }],
        error: null,
      }),
    }));
  });

  test("debería actualizar un usuario correctamente", async () => {
    const response = await request(app)
      .put("/usuarios/1")
      .send({
        nombre: "Usuario Actualizado",
        email: "actualizado@test.com",
        rol: "empleado"
      });

    expect(response.statusCode).toBe(200);
    expect(response.body[0].nombre).toBe("Usuario Actualizado");
  });

  test("debería devolver 404 si el usuario no existe", async () => {
    mockFrom = jest.fn(() => ({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    }));

    const response = await request(app)
      .put("/usuarios/999")
      .send({
        nombre: "Usuario Inexistente",
        email: "inexistente@test.com",
        rol: "empleado"
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Usuario no encontrado");
  });

  test("debería devolver 400 si hay error en la base de datos", async () => {
    mockFrom = jest.fn(() => ({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Error de base de datos" },
      }),
    }));

    const response = await request(app)
      .put("/usuarios/1")
      .send({
        nombre: "Usuario",
        email: "usuario@test.com",
        rol: "empleado"
      });

    expect(response.statusCode).toBe(400);
  });

  test("debería actualizar solo el nombre", async () => {
    const response = await request(app)
      .put("/usuarios/1")
      .send({
        nombre: "Nuevo Nombre",
        email: "email@test.com",
        rol: "empleado"
      });

    expect(response.statusCode).toBe(200);
  });

  test("debería actualizar solo el email", async () => {
    const response = await request(app)
      .put("/usuarios/1")
      .send({
        nombre: "Nombre",
        email: "nuevoemail@test.com",
        rol: "empleado"
      });

    expect(response.statusCode).toBe(200);
  });

  test("debería actualizar solo el rol", async () => {
    const response = await request(app)
      .put("/usuarios/1")
      .send({
        nombre: "Nombre",
        email: "email@test.com",
        rol: "empleador"
      });

    expect(response.statusCode).toBe(200);
  });

  test("debería actualizar todos los campos", async () => {
    const response = await request(app)
      .put("/usuarios/1")
      .send({
        nombre: "Nombre Completo Nuevo",
        email: "totalnuevo@test.com",
        rol: "empleador"
      });

    expect(response.statusCode).toBe(200);
  });
});