jest.mock("open", () => jest.fn());

import request from "supertest";
import app from "../app.js";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({ data: [{ id_usuario: 1 }], error: null }),
    })),
  })),
}));

describe("POST /usuarios - Validaciones", () => {
  test("debería devolver 400 si falta algún campo obligatorio", async () => {
    const response = await request(app).post("/usuarios").send({
      nombre: "Juan",
      rol: "Candidato",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Todos los campos son obligatorios.");
  });

  test("debería devolver 400 si el nombre es muy corto", async () => {
    const response = await request(app).post("/usuarios").send({
      nombre: "A",
      email: "a@a.com",
      rol: "Candidato",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("El nombre debe tener al menos 2 caracteres.");
  });

  test("debería devolver 400 si el email es inválido", async () => {
    const response = await request(app).post("/usuarios").send({
      nombre: "Juan",
      email: "juan@",
      rol: "Candidato",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("El email no tiene un formato válido.");
  });

  test("debería devolver 400 si el nombre contiene números", async () => {
    const response = await request(app).post("/usuarios").send({
      nombre: "Juan123",
      email: "juan@correo.com",
      rol: "Candidato",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("El nombre no puede contener números.");
  });

  test("debería devolver 400 si el nombre es genérico prohibido", async () => {
    const response = await request(app).post("/usuarios").send({
      nombre: "Empleado",
      email: "empleado@correo.com",
      rol: "Candidato",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("El nombre ingresado no es válido.");
  });

  test("debería devolver 201 si los datos son válidos", async () => {
    const response = await request(app).post("/usuarios").send({
      nombre: "Juan Perez",
      email: "juan@correo.com",
      rol: "Candidato",
    });
    expect(response.statusCode).toBe(201);   // ← CAMBIADO
  });
});
