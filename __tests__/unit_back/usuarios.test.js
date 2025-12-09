jest.mock("open", () => jest.fn()); // Evita que Jest ejecute el paquete 'open'

import request from "supertest";
import app from "../../app.js";
import { createClient } from "@supabase/supabase-js";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({
        data: [
          { id_usuario: 1, nombre: "Rocío", email: "rocio@test.com", rol: "Empleadora" },
          { id_usuario: 2, nombre: "Roy", email: "roy@test.com", rol: "Candidato" }
        ],
        error: null,
      }),
    })),
  })),
}));

describe("GET /usuarios", () => {
  test("debería devolver una lista de usuarios simulada", async () => {
    const response = await request(app).get("/usuarios");

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].nombre).toBe("Rocío");
  });
});