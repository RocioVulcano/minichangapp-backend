jest.mock("open", () => jest.fn());

jest.mock("@supabase/supabase-js", () => {
  const mockFrom = jest.fn(() => ({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockResolvedValue({
      data: [
        { id_usuario: 10, nombre: "Nuevo Usuario", email: "nuevo@correo.com", rol: "Candidato" },
      ],
      error: null,
    }),
  }));

  return {
    createClient: jest.fn(() => ({
      from: mockFrom,
    })),
    __esModule: true,
  };
});

import request from "supertest";
import app from "../index.js";
import { createClient } from "@supabase/supabase-js";

const mockFrom = createClient().from;

describe("POST /usuarios", () => {
  test("debería insertar un nuevo usuario y devolverlo", async () => {
    const nuevoUsuario = {
      nombre: "Nuevo Usuario",
      email: "nuevo@correo.com",
      rol: "Candidato",
    };

    const response = await request(app).post("/usuarios").send(nuevoUsuario);

    expect(response.statusCode).toBe(201);   // ← CAMBIADO
    expect(response.body[0].nombre).toBe("Nuevo Usuario");
    expect(response.body[0].rol).toBe("Candidato");
  });

  test("debería manejar errores al insertar un usuario", async () => {
    mockFrom.mockImplementationOnce(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Error al insertar" },
      }),
    }));

    const response = await request(app).post("/usuarios").send({
      nombre: "Error",
      email: "error@correo.com",
      rol: "Candidato",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Error al insertar");
  });
});
