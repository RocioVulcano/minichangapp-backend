jest.mock("open", () => jest.fn());

import request from "supertest";
import app from "../../app.js";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({ data: [{ id_usuario: 1 }], error: null }),
    })),
  })),
}));

describe("POST /usuarios - Validaciones de Email", () => {
  test("debería rechazar email sin @", async () => {
    const response = await request(app).post("/usuarios").send({
      nombre: "Juan Perez",
      email: "emailsinarro.com",
      rol: "empleado",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("El email no tiene un formato válido.");
  });

  test("debería rechazar email sin dominio", async () => {
    const response = await request(app).post("/usuarios").send({
      nombre: "Juan Perez",
      email: "email@",
      rol: "empleado",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("El email no tiene un formato válido.");
  });

  test("debería rechazar email sin usuario", async () => {
    const response = await request(app).post("/usuarios").send({
      nombre: "Juan Perez",
      email: "@dominio.com",
      rol: "empleado",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("El email no tiene un formato válido.");
  });

  test("debería rechazar email sin extensión", async () => {
    const response = await request(app).post("/usuarios").send({
      nombre: "Juan Perez",
      email: "email@dominio",
      rol: "empleado",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("El email no tiene un formato válido.");
  });

  test("debería aceptar email válido con .com", async () => {
    const response = await request(app).post("/usuarios").send({
      nombre: "Juan Perez",
      email: "juan@correo.com",
      rol: "empleado",
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería aceptar email válido con .ar", async () => {
    const response = await request(app).post("/usuarios").send({
      nombre: "Juan Perez",
      email: "juan@correo.ar",
      rol: "empleado",
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería aceptar email con números", async () => {
    const response = await request(app).post("/usuarios").send({
      nombre: "Juan Perez",
      email: "juan123@correo.com",
      rol: "empleado",
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería aceptar email con guiones", async () => {
    const response = await request(app).post("/usuarios").send({
      nombre: "Juan Perez",
      email: "juan-perez@correo.com",
      rol: "empleado",
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería aceptar email con puntos", async () => {
    const response = await request(app).post("/usuarios").send({
      nombre: "Juan Perez",
      email: "juan.perez@correo.com",
      rol: "empleado",
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería rechazar email con espacios", async () => {
    const response = await request(app).post("/usuarios").send({
      nombre: "Juan Perez",
      email: "juan perez@correo.com",
      rol: "empleado",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("El email no tiene un formato válido.");
  });
});