jest.mock("open", () => jest.fn());

jest.mock("@supabase/supabase-js", () => {
  const mockFrom = jest.fn(() => ({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockResolvedValue({
      data: [{ id_postulacion: 1, trabajo_id: 1, usuario_id: 1 }],
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

describe("POST /postulaciones - Casos edge", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Crear postulación sin trabajo_id", async () => {
    mockFrom.mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id_postulacion: 1, usuario_id: 1 }],
        error: null,
      }),
    }));

    const res = await request(app)
      .post("/postulaciones")
      .send({
        usuario_id: 1,
        mensaje: "Mensaje sin trabajo",
        oferta_pago: 5000,
      });

    expect(res.status).toBe(201);
  });

  test("Crear postulación sin usuario_id", async () => {
    mockFrom.mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id_postulacion: 1, trabajo_id: 1 }],
        error: null,
      }),
    }));

    const res = await request(app)
      .post("/postulaciones")
      .send({
        trabajo_id: 1,
        mensaje: "Mensaje sin usuario",
        oferta_pago: 5000,
      });

    expect(res.status).toBe(201);
  });

  test("Crear postulación sin mensaje", async () => {
    mockFrom.mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id_postulacion: 1, trabajo_id: 1, usuario_id: 1 }],
        error: null,
      }),
    }));

    const res = await request(app)
      .post("/postulaciones")
      .send({
        trabajo_id: 1,
        usuario_id: 1,
        oferta_pago: 5000,
      });

    expect(res.status).toBe(201);
  });

  test("Crear postulación sin oferta_pago", async () => {
    mockFrom.mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id_postulacion: 1, trabajo_id: 1, usuario_id: 1 }],
        error: null,
      }),
    }));

    const res = await request(app)
      .post("/postulaciones")
      .send({
        trabajo_id: 1,
        usuario_id: 1,
        mensaje: "Postulación sin pago",
      });

    expect(res.status).toBe(201);
  });

  test("Crear postulación vacía", async () => {
    mockFrom.mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id_postulacion: 1 }],
        error: null,
      }),
    }));

    const res = await request(app).post("/postulaciones").send({});

    expect(res.status).toBe(201);
  });

  test("Crear postulación con oferta_pago negativa", async () => {
    mockFrom.mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id_postulacion: 1, oferta_pago: -1000 }],
        error: null,
      }),
    }));

    const res = await request(app)
      .post("/postulaciones")
      .send({
        trabajo_id: 1,
        usuario_id: 1,
        mensaje: "Test",
        oferta_pago: -1000,
      });

    expect(res.status).toBe(201);
  });
});

describe("PUT /postulaciones/:id - Casos edge", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Actualizar postulación con campos vacíos", async () => {
    mockFrom.mockImplementationOnce(() => ({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id_postulacion: 1, mensaje: "", oferta_pago: null }],
        error: null,
      }),
    }));

    const res = await request(app)
      .put("/postulaciones/1")
      .send({
        mensaje: "",
        oferta_pago: null,
      });

    expect(res.status).toBe(200);
  });

  test("Actualizar postulación inexistente", async () => {
    mockFrom.mockImplementationOnce(() => ({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    }));

    const res = await request(app)
      .put("/postulaciones/999")
      .send({
        mensaje: "Test",
        oferta_pago: 5000,
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Postulación no encontrada");
  });

  test("Actualizar solo mensaje", async () => {
    mockFrom.mockImplementationOnce(() => ({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id_postulacion: 1, mensaje: "Nuevo mensaje" }],
        error: null,
      }),
    }));

    const res = await request(app).put("/postulaciones/1").send({ mensaje: "Nuevo mensaje" });

    expect(res.status).toBe(200);
  });

  test("Actualizar solo oferta_pago", async () => {
    mockFrom.mockImplementationOnce(() => ({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id_postulacion: 1, oferta_pago: 10000 }],
        error: null,
      }),
    }));

    const res = await request(app).put("/postulaciones/1").send({ oferta_pago: 10000 });

    expect(res.status).toBe(200);
  });
});