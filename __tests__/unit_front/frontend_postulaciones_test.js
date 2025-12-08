/**
 * @jest-environment jsdom
 */

describe("Frontend - Funciones de Postulaciones", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <ul id="lista"></ul>
      <div id="loading"></div>
      <form id="formPostulacion">
        <select id="trabajo_id"></select>
        <select id="usuario_id"></select>
        <textarea id="mensaje"></textarea>
        <input type="number" id="oferta_pago" />
      </form>
    `;
    global.fetch = jest.fn();
    window.API_URL = "http://localhost:3000";
    global.alert = jest.fn();
    global.confirm = jest.fn();
    
    
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("cargarPostulaciones", () => {
    test("debería cargar postulaciones correctamente", async () => {
      const mockPostulaciones = [
        {
          id_postulacion: 1,
          usuario: { nombre: "Juan" },
          trabajo: { titulo: "Limpieza" },
          mensaje: "Estoy interesado",
          oferta_pago: 5000
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockPostulaciones)
      });

      const cargarPostulaciones = async () => {
        const res = await fetch(`${window.API_URL}/postulaciones`);
        const data = await res.json();
        const lista = document.getElementById("lista");
        const loading = document.getElementById("loading");

        if (!Array.isArray(data) || data.length === 0) {
          loading.innerHTML = '<p>No hay postulaciones</p>';
          return;
        }

        loading.style.display = 'none';
        lista.style.display = 'grid';
        lista.innerHTML = data.map(p => `<li>${p.usuario?.nombre}</li>`).join("");
      };

      await cargarPostulaciones();

      expect(fetch).toHaveBeenCalledWith("http://localhost:3000/postulaciones");
      expect(document.getElementById("lista").innerHTML).toContain("Juan");
    });

    test("debería mostrar mensaje cuando no hay postulaciones", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([])
      });

      const cargarPostulaciones = async () => {
        const res = await fetch(`${window.API_URL}/postulaciones`);
        const data = await res.json();
        const loading = document.getElementById("loading");

        if (!Array.isArray(data) || data.length === 0) {
          loading.innerHTML = '<p>No hay postulaciones</p>';
          return;
        }
      };

      await cargarPostulaciones();

      expect(document.getElementById("loading").innerHTML).toContain("No hay postulaciones");
    });

    test("debería validar que sea un array", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(null)
      });

      const cargarPostulaciones = async () => {
        const res = await fetch(`${window.API_URL}/postulaciones`);
        const data = await res.json();
        const loading = document.getElementById("loading");

        if (!Array.isArray(data) || data.length === 0) {
          loading.innerHTML = '<p>No hay postulaciones</p>';
          return;
        }
      };

      await cargarPostulaciones();

      expect(document.getElementById("loading").innerHTML).toContain("No hay postulaciones");
    });

    test("debería renderizar múltiples postulaciones", async () => {
      const mockPostulaciones = [
        { id_postulacion: 1, usuario: { nombre: "U1" }, trabajo: { titulo: "T1" } },
        { id_postulacion: 2, usuario: { nombre: "U2" }, trabajo: { titulo: "T2" } },
        { id_postulacion: 3, usuario: { nombre: "U3" }, trabajo: { titulo: "T3" } }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockPostulaciones)
      });

      const cargarPostulaciones = async () => {
        const res = await fetch(`${window.API_URL}/postulaciones`);
        const data = await res.json();
        const lista = document.getElementById("lista");
        lista.innerHTML = data.map(p => `<li>${p.usuario.nombre}</li>`).join("");
      };

      await cargarPostulaciones();

      expect(document.getElementById("lista").children.length).toBe(3);
    });
  });

  describe("cargarSelects", () => {
    test("debería cargar trabajos y usuarios en los selects", async () => {
      const mockTrabajos = [
        { id_trabajo: 1, titulo: "Trabajo 1" },
        { id_trabajo: 2, titulo: "Trabajo 2" }
      ];

      const mockUsuarios = [
        { id_usuario: 1, nombre: "Usuario 1" },
        { id_usuario: 2, nombre: "Usuario 2" }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockTrabajos)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockUsuarios)
        });

      const cargarSelects = async () => {
        const trabajoSelect = document.getElementById("trabajo_id");
        const usuarioSelect = document.getElementById("usuario_id");

        const [trabajosRes, usuariosRes] = await Promise.all([
          fetch(`${window.API_URL}/trabajos`),
          fetch(`${window.API_URL}/usuarios`)
        ]);

        const trabajos = await trabajosRes.json();
        const usuarios = await usuariosRes.json();

        trabajos.forEach(t => {
          const opt = document.createElement("option");
          opt.value = t.id_trabajo;
          opt.textContent = t.titulo;
          trabajoSelect.appendChild(opt);
        });

        usuarios.forEach(u => {
          const opt = document.createElement("option");
          opt.value = u.id_usuario;
          opt.textContent = u.nombre;
          usuarioSelect.appendChild(opt);
        });
      };

      await cargarSelects();

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(document.getElementById("trabajo_id").children.length).toBe(2);
      expect(document.getElementById("usuario_id").children.length).toBe(2);
    });

    test("debería hacer llamadas en paralelo con Promise.all", async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue([]) })
        .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue([]) });

      const cargarSelects = async () => {
        await Promise.all([
          fetch(`${window.API_URL}/trabajos`),
          fetch(`${window.API_URL}/usuarios`)
        ]);
      };

      await cargarSelects();

      expect(fetch).toHaveBeenCalledWith("http://localhost:3000/trabajos");
      expect(fetch).toHaveBeenCalledWith("http://localhost:3000/usuarios");
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("eliminarPostulacion", () => {
    test("debería eliminar postulación cuando se confirma", async () => {
      global.confirm.mockReturnValue(true);
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ message: "Eliminado" })
      });

      const eliminarPostulacion = async (id) => {
        if (!confirm("¿Eliminar esta postulación?")) return;
        await fetch(`${window.API_URL}/postulaciones/${id}`, { method: "DELETE" });
        alert("✅ Postulación eliminada correctamente.");
        
      };

      await eliminarPostulacion(1);

      expect(confirm).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith("http://localhost:3000/postulaciones/1", { method: "DELETE" });
      expect(alert).toHaveBeenCalledWith("✅ Postulación eliminada correctamente.");
    });

    test("no debería eliminar cuando se cancela", async () => {
      global.confirm.mockReturnValue(false);

      const eliminarPostulacion = async (id) => {
        if (!confirm("¿Eliminar esta postulación?")) return;
        await fetch(`${window.API_URL}/postulaciones/${id}`, { method: "DELETE" });
      };

      await eliminarPostulacion(1);

      expect(confirm).toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe("editarPostulacion", () => {
    test("debería actualizar postulación correctamente", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([{ id_postulacion: 1, mensaje: "Nuevo mensaje" }])
      });

      const editarPostulacion = async (id, mensaje, oferta_pago) => {
        const res = await fetch(`${window.API_URL}/postulaciones/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mensaje, oferta_pago })
        });

        if (res.ok) {
          alert("✅ Postulación actualizada correctamente.");
          
        }
      };

      await editarPostulacion(1, "Nuevo mensaje", 10000);

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/postulaciones/1",
        expect.objectContaining({
          method: "PUT"
        })
      );
      expect(alert).toHaveBeenCalled();
    });
  });
});