jest.mock("open", () => jest.fn());

import request from "supertest";
import app from "../../app.js";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((table) => {
      if (table === "trabajo") {
        return {
          select: jest.fn().mockResolvedValue({
            data: [
              {
                id_trabajo: 1,
                titulo: "Trabajo de prueba",
                descripcion: "Descripción",
                ubicacion: "Córdoba",
                fecha_publicado: "2025-01-01",
                empleador: {
                  id_usuario: 1,
                  nombre: "Empleador Test",
                  email: "empleador@test.com"
                }
              }
            ],
            error: null
          })
        };
      }
      if (table === "postulacion") {
        return {
          select: jest.fn().mockResolvedValue({
            data: [
              {
                id_postulacion: 1,
                trabajo_id: 1,
                usuario_id: 1,
                mensaje: "Mensaje de prueba",
                oferta_pago: 5000
              }
            ],
            error: null
          })
        };
      }
    })
  }))
}));

describe("GET /trabajos - Obtener trabajos", () => {
  test("debería devolver un array de trabajos", async () => {
    const response = await request(app).get("/trabajos");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("debería devolver trabajos con estructura correcta", async () => {
    const response = await request(app).get("/trabajos");
    expect(response.body[0]).toHaveProperty("id_trabajo");
    expect(response.body[0]).toHaveProperty("titulo");
    expect(response.body[0]).toHaveProperty("descripcion");
  });

  test("debería incluir información del empleador", async () => {
    const response = await request(app).get("/trabajos");
    expect(response.body[0]).toHaveProperty("empleador");
  });

  test("debería devolver status 200", async () => {
    const response = await request(app).get("/trabajos");
    expect(response.statusCode).toBe(200);
  });

  test("debería devolver datos en formato JSON", async () => {
    const response = await request(app).get("/trabajos");
    expect(response.type).toBe("application/json");
  });
});

describe("GET /postulaciones - Obtener postulaciones", () => {
  test("debería devolver un array de postulaciones", async () => {
    const response = await request(app).get("/postulaciones");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("debería devolver postulaciones con estructura correcta", async () => {
    const response = await request(app).get("/postulaciones");
    expect(response.body[0]).toHaveProperty("id_postulacion");
    expect(response.body[0]).toHaveProperty("trabajo_id");
    expect(response.body[0]).toHaveProperty("usuario_id");
  });

  test("debería devolver status 200", async () => {
    const response = await request(app).get("/postulaciones");
    expect(response.statusCode).toBe(200);
  });

  test("debería incluir mensaje en las postulaciones", async () => {
    const response = await request(app).get("/postulaciones");
    expect(response.body[0]).toHaveProperty("mensaje");
  });

  test("debería incluir oferta_pago en las postulaciones", async () => {
    const response = await request(app).get("/postulaciones");
    expect(response.body[0]).toHaveProperty("oferta_pago");
  });

  test("debería devolver datos en formato JSON", async () => {
    const response = await request(app).get("/postulaciones");
    expect(response.type).toBe("application/json");
  });
});