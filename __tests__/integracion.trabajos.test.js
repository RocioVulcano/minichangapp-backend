// __tests__/integracion.trabajos.test.js
import request from "supertest";
import app from "../index.js";

describe("🧪 Pruebas de integración - Trabajos", () => {

  test("GET /trabajos → debería devolver un array (aunque esté vacío)", async () => {
    const response = await request(app).get("/trabajos");
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("POST /trabajos → debería crear un nuevo trabajo y devolver 201", async () => {
    const nuevoTrabajo = {
      titulo: "Limpieza de patio",
      descripcion: "Se necesita limpieza general",
      ubicacion: "Córdoba Capital",
      empleador_id: 1
    };

    const response = await request(app).post("/trabajos").send(nuevoTrabajo);

    expect(response.statusCode).toBe(201);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty("titulo");
    expect(response.body[0]).toHaveProperty("descripcion");
  });

});
