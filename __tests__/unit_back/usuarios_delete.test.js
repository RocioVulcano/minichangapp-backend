jest.mock("open", () => jest.fn());

import request from "supertest";
import app from "../../app.js";

// Mock de Supabase
let mockFrom;

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((table) => {
      return mockFrom ? mockFrom() : {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };
    }),
  })),
}));

describe("DELETE /usuarios/:id - Eliminar usuario", () => {
  beforeEach(() => {
    // Resetear mockFrom antes de cada test
    mockFrom = jest.fn(() => ({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    }));
  });

  test("debería eliminar un usuario correctamente", async () => {
    const response = await request(app).delete("/usuarios/1");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Usuario eliminado correctamente");
  });

  test("debería devolver 400 si hay error en la base de datos", async () => {
    mockFrom = jest.fn(() => ({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Error al eliminar" },
      }),
    }));

    const response = await request(app).delete("/usuarios/1");

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Error al eliminar");
  });

  test("debería manejar IDs numéricos", async () => {
    const response = await request(app).delete("/usuarios/123");
    expect(response.statusCode).toBe(200);
  });

  test("debería manejar IDs de usuario muy grandes", async () => {
    const response = await request(app).delete("/usuarios/999999");
    expect(response.statusCode).toBe(200);
  });

  test("debería retornar el mensaje correcto al eliminar", async () => {
    const response = await request(app).delete("/usuarios/1");
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Usuario eliminado correctamente");
  });
});