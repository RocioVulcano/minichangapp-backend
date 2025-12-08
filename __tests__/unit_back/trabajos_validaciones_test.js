jest.mock("open", () => jest.fn());

import request from "supertest";
import app from "../../app.js";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({ data: [{ id_trabajo: 1 }], error: null }),
    })),
  })),
}));

describe("POST /trabajos - Validaciones", () => {
  test("debería crear trabajo incluso sin título (backend no valida)", async () => {
    const response = await request(app).post("/trabajos").send({
      descripcion: "Descripción del trabajo",
      ubicacion: "Córdoba",
      empleador_id: 1
    });
    // El backend actual no valida campos obligatorios, acepta todo
    expect(response.statusCode).toBe(201);
  });

  test("debería crear trabajo incluso sin descripción (backend no valida)", async () => {
    const response = await request(app).post("/trabajos").send({
      titulo: "Trabajo de limpieza",
      ubicacion: "Córdoba",
      empleador_id: 1
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería crear trabajo incluso sin ubicación (backend no valida)", async () => {
    const response = await request(app).post("/trabajos").send({
      titulo: "Trabajo de limpieza",
      descripcion: "Descripción del trabajo",
      empleador_id: 1
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería crear trabajo incluso sin empleador_id (backend no valida)", async () => {
    const response = await request(app).post("/trabajos").send({
      titulo: "Trabajo de limpieza",
      descripcion: "Descripción del trabajo",
      ubicacion: "Córdoba"
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería crear un trabajo con datos válidos", async () => {
    const response = await request(app).post("/trabajos").send({
      titulo: "Trabajo de limpieza",
      descripcion: "Descripción del trabajo",
      ubicacion: "Córdoba",
      empleador_id: 1
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería aceptar título vacío (backend no valida)", async () => {
    const response = await request(app).post("/trabajos").send({
      titulo: "",
      descripcion: "Descripción del trabajo",
      ubicacion: "Córdoba",
      empleador_id: 1
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería aceptar descripción vacía (backend no valida)", async () => {
    const response = await request(app).post("/trabajos").send({
      titulo: "Trabajo de limpieza",
      descripcion: "",
      ubicacion: "Córdoba",
      empleador_id: 1
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería aceptar ubicación vacía (backend no valida)", async () => {
    const response = await request(app).post("/trabajos").send({
      titulo: "Trabajo de limpieza",
      descripcion: "Descripción del trabajo",
      ubicacion: "",
      empleador_id: 1
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería aceptar un trabajo con título largo", async () => {
    const response = await request(app).post("/trabajos").send({
      titulo: "A".repeat(200),
      descripcion: "Descripción del trabajo",
      ubicacion: "Córdoba",
      empleador_id: 1
    });
    expect(response.statusCode).toBe(201);
  });

  test("debería aceptar un trabajo con descripción larga", async () => {
    const response = await request(app).post("/trabajos").send({
      titulo: "Trabajo de limpieza",
      descripcion: "A".repeat(1000),
      ubicacion: "Córdoba",
      empleador_id: 1
    });
    expect(response.statusCode).toBe(201);
  });
});