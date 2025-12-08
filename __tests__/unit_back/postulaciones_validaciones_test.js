jest.mock("open", () => jest.fn());

import request from "supertest";
import app from "../../app.js";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({ 
        data: [{ 
          id_postulacion: 1, 
          trabajo_id: 1, 
          usuario_id: 1,
          mensaje: "Mensaje de prueba",
          oferta_pago: 5000
        }], 
        error: null 
      }),
    })),
  })),
}));

describe("POST /postulaciones - Validaciones extendidas", () => {
  test("debería crear postulación sin mensaje", async () => {
    const response = await request(app).post("/postulaciones").send({
      trabajo_id: 1,
      usuario_id: 1,
      oferta_pago: 5000
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería crear postulación sin oferta_pago", async () => {
    const response = await request(app).post("/postulaciones").send({
      trabajo_id: 1,
      usuario_id: 1,
      mensaje: "Estoy interesado"
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería crear postulación solo con campos requeridos", async () => {
    const response = await request(app).post("/postulaciones").send({
      trabajo_id: 1,
      usuario_id: 1
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería crear postulación incluso sin trabajo_id (backend no valida)", async () => {
    const response = await request(app).post("/postulaciones").send({
      usuario_id: 1,
      mensaje: "Mensaje"
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería crear postulación incluso sin usuario_id (backend no valida)", async () => {
    const response = await request(app).post("/postulaciones").send({
      trabajo_id: 1,
      mensaje: "Mensaje"
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería aceptar mensaje largo", async () => {
    const response = await request(app).post("/postulaciones").send({
      trabajo_id: 1,
      usuario_id: 1,
      mensaje: "A".repeat(500)
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería aceptar oferta_pago de 0", async () => {
    const response = await request(app).post("/postulaciones").send({
      trabajo_id: 1,
      usuario_id: 1,
      oferta_pago: 0
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería aceptar oferta_pago muy alta", async () => {
    const response = await request(app).post("/postulaciones").send({
      trabajo_id: 1,
      usuario_id: 1,
      oferta_pago: 1000000
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería retornar los datos de la postulación creada", async () => {
    const response = await request(app).post("/postulaciones").send({
      trabajo_id: 1,
      usuario_id: 1,
      mensaje: "Mensaje de prueba"
    });
    expect(response.body).toHaveProperty("0");
    expect(response.body[0]).toHaveProperty("mensaje");
  });

  test("debería crear postulación con todos los campos", async () => {
    const response = await request(app).post("/postulaciones").send({
      trabajo_id: 1,
      usuario_id: 1,
      mensaje: "Estoy muy interesado en este trabajo",
      oferta_pago: 25000
    });
    expect(response.statusCode).toBe(201);
    expect(response.body[0]).toHaveProperty("trabajo_id");
    expect(response.body[0]).toHaveProperty("usuario_id");
  });
});