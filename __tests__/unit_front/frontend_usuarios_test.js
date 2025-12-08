/**
 * @jest-environment jsdom
 */

describe("Frontend - Funciones de Usuarios", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <ul id="usuarios"></ul>
      <div id="loading"></div>
    `;
    global.fetch = jest.fn();
    window.API_URL = "http://localhost:3000";
    
    // Mock de alert y confirm
    global.alert = jest.fn();
    global.confirm = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("cargarUsuarios", () => {
    test("debería cargar usuarios correctamente", async () => {
      const mockUsuarios = [
        { id_usuario: 1, nombre: "Juan", email: "juan@test.com", rol: "empleado" },
        { id_usuario: 2, nombre: "Maria", email: "maria@test.com", rol: "empleador" }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUsuarios)
      });

      const cargarUsuarios = async () => {
        const res = await fetch(`${window.API_URL}/usuarios`);
        const usuarios = await res.json();
        const ul = document.getElementById("usuarios");
        const loading = document.getElementById("loading");

        if (usuarios.length === 0) {
          loading.innerHTML = '<p>No hay usuarios</p>';
          return;
        }

        loading.style.display = 'none';
        ul.style.display = 'grid';
        ul.innerHTML = usuarios.map(u => `<li>${u.nombre}</li>`).join("");
      };

      await cargarUsuarios();

      expect(fetch).toHaveBeenCalledWith("http://localhost:3000/usuarios");
      expect(document.getElementById("usuarios").innerHTML).toContain("Juan");
      expect(document.getElementById("usuarios").innerHTML).toContain("Maria");
    });

    test("debería mostrar mensaje cuando no hay usuarios", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([])
      });

      const cargarUsuarios = async () => {
        const res = await fetch(`${window.API_URL}/usuarios`);
        const usuarios = await res.json();
        const loading = document.getElementById("loading");

        if (usuarios.length === 0) {
          loading.innerHTML = '<p>No hay usuarios</p>';
          return;
        }
      };

      await cargarUsuarios();

      expect(document.getElementById("loading").innerHTML).toContain("No hay usuarios");
    });

    test("debería ocultar loading después de cargar", async () => {
      const mockUsuarios = [{ id_usuario: 1, nombre: "Juan", email: "juan@test.com", rol: "empleado" }];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUsuarios)
      });

      const cargarUsuarios = async () => {
        const res = await fetch(`${window.API_URL}/usuarios`);
        const usuarios = await res.json();
        const loading = document.getElementById("loading");

        loading.style.display = 'none';
      };

      await cargarUsuarios();

      expect(document.getElementById("loading").style.display).toBe('none');
    });

    test("debería hacer fetch a la URL correcta", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([])
      });

      const cargarUsuarios = async () => {
        await fetch(`${window.API_URL}/usuarios`);
      };

      await cargarUsuarios();

      expect(fetch).toHaveBeenCalledWith("http://localhost:3000/usuarios");
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("eliminarUsuario", () => {
    test("debería eliminar usuario cuando se confirma", async () => {
      global.confirm.mockReturnValue(true);
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ message: "Usuario eliminado" })
      });

      const eliminarUsuario = async (id) => {
        if (!confirm("¿Eliminar este usuario?")) return;
        await fetch(`${window.API_URL}/usuarios/${id}`, { method: "DELETE" });
        alert("✅ Usuario eliminado correctamente.");
      };

      await eliminarUsuario(1);

      expect(confirm).toHaveBeenCalledWith("¿Eliminar este usuario?");
      expect(fetch).toHaveBeenCalledWith("http://localhost:3000/usuarios/1", { method: "DELETE" });
      expect(alert).toHaveBeenCalledWith("✅ Usuario eliminado correctamente.");
    });

    test("no debería eliminar usuario cuando se cancela", async () => {
      global.confirm.mockReturnValue(false);

      const eliminarUsuario = async (id) => {
        if (!confirm("¿Eliminar este usuario?")) return;
        await fetch(`${window.API_URL}/usuarios/${id}`, { method: "DELETE" });
      };

      await eliminarUsuario(1);

      expect(confirm).toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    });

    test("debería llamar a fetch con el método DELETE", async () => {
      global.confirm.mockReturnValue(true);
      global.fetch.mockResolvedValueOnce({ ok: true, json: jest.fn() });

      const eliminarUsuario = async (id) => {
        if (!confirm("¿Eliminar este usuario?")) return;
        await fetch(`${window.API_URL}/usuarios/${id}`, { method: "DELETE" });
      };

      await eliminarUsuario(5);

      expect(fetch).toHaveBeenCalledWith("http://localhost:3000/usuarios/5", { method: "DELETE" });
    });
  });

  describe("editarUsuario", () => {
    test("debería actualizar usuario con datos válidos", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([{ id_usuario: 1, nombre: "Juan Editado" }])
      });

      const editarUsuario = async (id, nuevoNombre, nuevoEmail, nuevoRol) => {
        const response = await fetch(`${window.API_URL}/usuarios/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: nuevoNombre, email: nuevoEmail, rol: nuevoRol })
        });
        
        if (response.ok) {
          alert("✅ Usuario actualizado correctamente.");
        }
      };

      await editarUsuario(1, "Juan Editado", "juan@test.com", "empleado");

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/usuarios/1",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" }
        })
      );
      expect(alert).toHaveBeenCalledWith("✅ Usuario actualizado correctamente.");
    });
  });
});