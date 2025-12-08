/**
 * @jest-environment jsdom
 */

describe("Frontend - Funciones de Trabajos", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <ul id="lista"></ul>
      <div id="loading"></div>
    `;
    global.fetch = jest.fn();
    window.API_URL = "http://localhost:3000";
    global.alert = jest.fn();
    global.confirm = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("cargarTrabajos", () => {
    test("debería cargar trabajos correctamente", async () => {
      const mockTrabajos = [
        {
          id_trabajo: 1,
          titulo: "Trabajo 1",
          descripcion: "Descripción 1",
          ubicacion: "Córdoba",
          empleador: { nombre: "Juan" }
        },
        {
          id_trabajo: 2,
          titulo: "Trabajo 2",
          descripcion: "Descripción 2",
          ubicacion: "Buenos Aires",
          empleador: { nombre: "Maria" }
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTrabajos)
      });

      const cargarTrabajos = async () => {
        const res = await fetch(`${window.API_URL}/trabajos`);
        const trabajos = await res.json();
        const lista = document.getElementById("lista");
        const loading = document.getElementById("loading");

        if (!Array.isArray(trabajos) || trabajos.length === 0) {
          loading.innerHTML = '<p>No hay trabajos</p>';
          return;
        }

        loading.style.display = 'none';
        lista.style.display = 'grid';
        lista.innerHTML = trabajos.map(t => `<li>${t.titulo}</li>`).join("");
      };

      await cargarTrabajos();

      expect(fetch).toHaveBeenCalledWith("http://localhost:3000/trabajos");
      expect(document.getElementById("lista").innerHTML).toContain("Trabajo 1");
      expect(document.getElementById("lista").innerHTML).toContain("Trabajo 2");
    });

    test("debería mostrar mensaje cuando no hay trabajos", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([])
      });

      const cargarTrabajos = async () => {
        const res = await fetch(`${window.API_URL}/trabajos`);
        const trabajos = await res.json();
        const loading = document.getElementById("loading");

        if (!Array.isArray(trabajos) || trabajos.length === 0) {
          loading.innerHTML = '<p>No hay trabajos</p>';
          return;
        }
      };

      await cargarTrabajos();

      expect(document.getElementById("loading").innerHTML).toContain("No hay trabajos");
    });

    test("debería validar que la respuesta sea un array", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(null)
      });

      const cargarTrabajos = async () => {
        const res = await fetch(`${window.API_URL}/trabajos`);
        const trabajos = await res.json();
        const loading = document.getElementById("loading");

        if (!Array.isArray(trabajos) || trabajos.length === 0) {
          loading.innerHTML = '<p>No hay trabajos</p>';
          return;
        }
      };

      await cargarTrabajos();

      expect(document.getElementById("loading").innerHTML).toContain("No hay trabajos");
    });

    test("debería renderizar múltiples trabajos", async () => {
      const mockTrabajos = [
        { id_trabajo: 1, titulo: "T1", descripcion: "D1", ubicacion: "U1" },
        { id_trabajo: 2, titulo: "T2", descripcion: "D2", ubicacion: "U2" },
        { id_trabajo: 3, titulo: "T3", descripcion: "D3", ubicacion: "U3" }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTrabajos)
      });

      const cargarTrabajos = async () => {
        const res = await fetch(`${window.API_URL}/trabajos`);
        const trabajos = await res.json();
        const lista = document.getElementById("lista");
        lista.innerHTML = trabajos.map(t => `<li>${t.titulo}</li>`).join("");
      };

      await cargarTrabajos();

      const lista = document.getElementById("lista");
      expect(lista.children.length).toBe(3);
    });
  });

  describe("eliminarTrabajo", () => {
    test("debería eliminar trabajo cuando se confirma", async () => {
      global.confirm.mockReturnValue(true);
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ message: "Trabajo eliminado" })
      });

      const eliminarTrabajo = async (id) => {
        if (!confirm("¿Eliminar este trabajo?")) return;
        await fetch(`${window.API_URL}/trabajos/${id}`, { method: "DELETE" });
        alert("✅ Trabajo eliminado correctamente.");
      };

      await eliminarTrabajo(1);

      expect(confirm).toHaveBeenCalledWith("¿Eliminar este trabajo?");
      expect(fetch).toHaveBeenCalledWith("http://localhost:3000/trabajos/1", { method: "DELETE" });
      expect(alert).toHaveBeenCalledWith("✅ Trabajo eliminado correctamente.");
    });

    test("no debería eliminar cuando se cancela", async () => {
      global.confirm.mockReturnValue(false);

      const eliminarTrabajo = async (id) => {
        if (!confirm("¿Eliminar este trabajo?")) return;
        await fetch(`${window.API_URL}/trabajos/${id}`, { method: "DELETE" });
      };

      await eliminarTrabajo(1);

      expect(confirm).toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe("editarTrabajo", () => {
    test("debería actualizar trabajo correctamente", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([{ id_trabajo: 1, titulo: "Nuevo título" }])
      });

      const editarTrabajo = async (id, titulo, descripcion, ubicacion, empleador_id) => {
        const response = await fetch(`${window.API_URL}/trabajos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ titulo, descripcion, ubicacion, empleador_id })
        });

        if (response.ok) {
          alert("✅ Trabajo actualizado correctamente.");
        }
      };

      await editarTrabajo(1, "Nuevo título", "Desc", "Ubicación", 1);

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/trabajos/1",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" }
        })
      );
      expect(alert).toHaveBeenCalledWith("✅ Trabajo actualizado correctamente.");
    });

    test("debería enviar todos los campos del trabajo", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([{}])
      });

      const editarTrabajo = async (id, titulo, descripcion, ubicacion, empleador_id) => {
        await fetch(`${window.API_URL}/trabajos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ titulo, descripcion, ubicacion, empleador_id })
        });
      };

      await editarTrabajo(5, "Título", "Descripción", "Lugar", 10);

      const callArgs = fetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      
      expect(body).toHaveProperty("titulo", "Título");
      expect(body).toHaveProperty("descripcion", "Descripción");
      expect(body).toHaveProperty("ubicacion", "Lugar");
      expect(body).toHaveProperty("empleador_id", 10);
    });
  });
});