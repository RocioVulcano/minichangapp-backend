jest.mock("open", () => jest.fn());

jest.mock("@supabase/supabase-js", () => {
  const mockFrom = jest.fn(() => ({
    select: jest.fn().mockResolvedValue({
      data: [{ id_usuario: 1, nombre: "Test" }],
      error: null,
    }),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
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

describe("Errores de Supabase - Usuarios", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /usuarios con error de Supabase", async () => {
    mockFrom.mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Database connection failed" },
      }),
    }));

    const res = await request(app).get("/usuarios");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Database connection failed");
  });

  test("GET /usuarios/:id con error de Supabase", async () => {
    mockFrom.mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Query error" },
      }),
    }));

    const res = await request(app).get("/usuarios/1");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Query error");
  });

  test("POST /usuarios con error de Supabase", async () => {
    mockFrom.mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Insert failed" },
      }),
    }));

    const res = await request(app)
      .post("/usuarios")
      .send({
        nombre: "Test User",
        email: "test@test.com",
        rol: "candidato",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Insert failed");
  });

  test("PUT /usuarios/:id con error de Supabase", async () => {
    mockFrom.mockImplementationOnce(() => ({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Update failed" },
      }),
    }));

    const res = await request(app)
      .put("/usuarios/1")
      .send({
        nombre: "Updated",
        email: "updated@test.com",
        rol: "empleador",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Update failed");
  });

  test("DELETE /usuarios/:id con error de Supabase", async () => {
    mockFrom.mockImplementationOnce(() => ({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        error: { message: "Delete failed" },
      }),
    }));

    const res = await request(app).delete("/usuarios/1");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Delete failed");
  });
});

describe("Errores de Supabase - Trabajos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /trabajos con error de Supabase", async () => {
    mockFrom.mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Query failed" },
      }),
    }));

    const res = await request(app).get("/trabajos");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Query failed");
  });

  test("GET /trabajos/:id con error de Supabase", async () => {
    mockFrom.mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Not found" },
      }),
    }));

    const res = await request(app).get("/trabajos/1");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Not found");
  });

  test("POST /trabajos con error de Supabase", async () => {
    mockFrom.mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Insert error" },
      }),
    }));

    const res = await request(app)
      .post("/trabajos")
      .send({
        titulo: "Test",
        descripcion: "Test",
        ubicacion: "Test",
        empleador_id: 1,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Insert error");
  });

  test("PUT /trabajos/:id con error de Supabase", async () => {
    mockFrom.mockImplementationOnce(() => ({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Update error" },
      }),
    }));

    const res = await request(app)
      .put("/trabajos/1")
      .send({
        titulo: "Updated",
        descripcion: "Updated",
        ubicacion: "Updated",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Update error");
  });

  test("DELETE /trabajos/:id con error de Supabase", async () => {
    mockFrom.mockImplementationOnce(() => ({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        error: { message: "Delete error" },
      }),
    }));

    const res = await request(app).delete("/trabajos/1");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Delete error");
  });
});

describe("Errores de Supabase - Postulaciones", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /postulaciones con error de Supabase", async () => {
    mockFrom.mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      }),
    }));

    const res = await request(app).get("/postulaciones");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Database error");
  });

  test("GET /postulaciones/:id con error de Supabase", async () => {
    mockFrom.mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Query error" },
      }),
    }));

    const res = await request(app).get("/postulaciones/1");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Query error");
  });

  test("POST /postulaciones con error de Supabase", async () => {
    mockFrom.mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Insert failed" },
      }),
    }));

    const res = await request(app)
      .post("/postulaciones")
      .send({
        trabajo_id: 1,
        usuario_id: 1,
        mensaje: "Test",
        oferta_pago: 5000,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Insert failed");
  });

  test("PUT /postulaciones/:id con error de Supabase", async () => {
    mockFrom.mockImplementationOnce(() => ({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Update failed" },
      }),
    }));

    const res = await request(app)
      .put("/postulaciones/1")
      .send({
        mensaje: "Updated",
        oferta_pago: 10000,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Update failed");
  });

  test("DELETE /postulaciones/:id con error de Supabase", async () => {
    mockFrom.mockImplementationOnce(() => ({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        error: { message: "Delete failed" },
      }),
    }));

    const res = await request(app).delete("/postulaciones/1");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Delete failed");
  });
});