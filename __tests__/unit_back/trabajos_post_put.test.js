jest.mock("open", () => jest.fn());

jest.mock("@supabase/supabase-js", () => {
  const mockFrom = jest.fn(() => ({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockResolvedValue({
      data: [{ id_trabajo: 1, titulo: "Test", descripcion: "Test" }],
      error: null,
    }),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
  }));

  return {
    createClient: jest.fn(() => ({
      from: mockFrom,
    })),
    __esModule: true,
  };
});

import request from "supertest";
import app from "../../app.js";
import { createClient } from "@supabase/supabase-js";

const mockFrom = createClient().from;

describe("POST /trabajos - Casos edge", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Crear trabajo sin titulo", async () => {
    mockFrom.mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id_trabajo: 1, descripcion: "Trabajo sin titulo" }],
        error: null,
      }),
    }));

    const res = await request(app)
      .post("/trabajos")
      .send({
        descripcion: "Trabajo sin titulo",
        ubicacion: "Buenos Aires",
        empleador_id: 1,
      });

    expect(res.status).toBe(201);
  });

  test("Crear trabajo sin descripcion", async () => {
    mockFrom.mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id_trabajo: 1, titulo: "Trabajo sin descripcion" }],
        error: null,
      }),
    }));

    const res = await request(app)
      .post("/trabajos")
      .send({
        titulo: "Trabajo sin descripcion",
        ubicacion: "Buenos Aires",
        empleador_id: 1,
      });

    expect(res.status).toBe(201);
  });

  test("Crear trabajo sin ubicacion", async () => {
    mockFrom.mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id_trabajo: 1, titulo: "Test" }],
        error: null,
      }),
    }));

    const res = await request(app)
      .post("/trabajos")
      .send({
        titulo: "Trabajo sin ubicacion",
        descripcion: "Descripción",
        empleador_id: 1,
      });

    expect(res.status).toBe(201);
  });

  test("Crear trabajo sin empleador_id", async () => {
    mockFrom.mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id_trabajo: 1, titulo: "Test" }],
        error: null,
      }),
    }));

    const res = await request(app)
      .post("/trabajos")
      .send({
        titulo: "Trabajo sin empleador",
        descripcion: "Descripción",
        ubicacion: "Buenos Aires",
      });

    expect(res.status).toBe(201);
  });

  test("Crear trabajo con todos los campos vacíos", async () => {
    mockFrom.mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id_trabajo: 1 }],
        error: null,
      }),
    }));

    const res = await request(app).post("/trabajos").send({});

    expect(res.status).toBe(201);
  });
});

describe("PUT /trabajos/:id - Casos edge", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Actualizar trabajo con campos vacíos", async () => {
    mockFrom.mockImplementationOnce(() => ({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id_trabajo: 1, titulo: "", descripcion: "", ubicacion: "" }],
        error: null,
      }),
    }));

    const res = await request(app)
      .put("/trabajos/1")
      .send({
        titulo: "",
        descripcion: "",
        ubicacion: "",
      });

    expect(res.status).toBe(200);
  });

  test("Actualizar trabajo inexistente", async () => {
    mockFrom.mockImplementationOnce(() => ({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    }));

    const res = await request(app)
      .put("/trabajos/999")
      .send({
        titulo: "Test",
        descripcion: "Test",
        ubicacion: "Test",
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Trabajo no encontrado");
  });

  test("Actualizar solo titulo", async () => {
    mockFrom.mockImplementationOnce(() => ({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id_trabajo: 1, titulo: "Nuevo titulo" }],
        error: null,
      }),
    }));

    const res = await request(app).put("/trabajos/1").send({ titulo: "Nuevo titulo" });

    expect(res.status).toBe(200);
  });
});