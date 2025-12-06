// __tests__/integracion.postulaciones.test.js
import request from "supertest";
import app from "../app.js";

describe("🧪 Pruebas de integración - Postulaciones", () => {

  test("GET /postulaciones → debería devolver un array", async () => {
    const response = await request(app).get("/postulaciones");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("POST /postulaciones → debería crear una postulación y devolver 201", async () => {
    const nuevaPostulacion = {
      trabajo_id: 1,
      usuario_id: 1,
      mensaje: "Estoy interesado en el trabajo",
      oferta_pago: 5000
    };

    const response = await request(app).post("/postulaciones").send(nuevaPostulacion);

    expect(response.statusCode).toBe(201);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty("mensaje");
  });

});
