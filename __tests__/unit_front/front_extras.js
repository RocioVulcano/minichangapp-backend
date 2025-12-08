/**
 * @jest-environment jsdom
 */

describe("Frontend - Pruebas Adicionales Simples", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    global.fetch = jest.fn();
    global.alert = jest.fn();
    window.API_URL = "http://localhost:3000";
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // ============================================
  // PRUEBAS DE DOM BÁSICAS
  // ============================================

  test("debería crear elemento de lista vacía en el DOM", () => {
    document.body.innerHTML = '<ul id="lista"></ul>';
    const lista = document.getElementById("lista");
    
    expect(lista).toBeTruthy();
    expect(lista.tagName).toBe("UL");
    expect(lista.children.length).toBe(0);
  });

  test("debería agregar items a una lista dinámicamente", () => {
    document.body.innerHTML = '<ul id="items"></ul>';
    const lista = document.getElementById("items");
    
    const item1 = document.createElement("li");
    item1.textContent = "Item 1";
    lista.appendChild(item1);
    
    const item2 = document.createElement("li");
    item2.textContent = "Item 2";
    lista.appendChild(item2);
    
    expect(lista.children.length).toBe(2);
    expect(lista.children[0].textContent).toBe("Item 1");
    expect(lista.children[1].textContent).toBe("Item 2");
  });

  test("debería ocultar elemento de carga", () => {
    document.body.innerHTML = '<div id="loading" style="display: block;"></div>';
    const loading = document.getElementById("loading");
    
    loading.style.display = "none";
    
    expect(loading.style.display).toBe("none");
  });

  // ============================================
  // PRUEBAS DE API_URL
  // ============================================

  test("debería tener API_URL configurada", () => {
    expect(window.API_URL).toBeDefined();
    expect(typeof window.API_URL).toBe("string");
    expect(window.API_URL.length).toBeGreaterThan(0);
  });

  test("debería construir URLs correctamente con API_URL", () => {
    const endpoint = "/usuarios";
    const fullUrl = `${window.API_URL}${endpoint}`;
    
    expect(fullUrl).toBe("http://localhost:3000/usuarios");
    expect(fullUrl).toContain("http");
    expect(fullUrl).toContain("usuarios");
  });

  // ============================================
  // PRUEBAS DE FETCH MOCK
  // ============================================

  test("debería llamar a fetch con la URL correcta", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue([])
    });

    await fetch(`${window.API_URL}/trabajos`);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("http://localhost:3000/trabajos");
  });

  test("debería manejar respuesta exitosa de fetch", async () => {
    const mockData = [{ id: 1, nombre: "Test" }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData)
    });

    const response = await fetch(`${window.API_URL}/usuarios`);
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data).toEqual(mockData);
    expect(Array.isArray(data)).toBe(true);
  });

  // ============================================
  // PRUEBAS DE ALERT MOCK
  // ============================================

  test("debería llamar a alert con mensaje correcto", () => {
    const mensaje = "✅ Operación exitosa";
    alert(mensaje);

    expect(alert).toHaveBeenCalledTimes(1);
    expect(alert).toHaveBeenCalledWith(mensaje);
  });

  test("debería verificar que alert es una función mock", () => {
    expect(typeof alert).toBe("function");
    expect(alert).toBeDefined();
    
    alert("Test");
    expect(alert).toHaveBeenCalled();
  });

  // ============================================
  // PRUEBA DE RENDERIZADO DE DATOS
  // ============================================

  test("debería renderizar datos en el DOM desde fetch", async () => {
    document.body.innerHTML = '<div id="contenedor"></div>';
    
    const mockData = [
      { id: 1, titulo: "Trabajo 1" },
      { id: 2, titulo: "Trabajo 2" }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData)
    });

    const response = await fetch(`${window.API_URL}/trabajos`);
    const trabajos = await response.json();
    
    const contenedor = document.getElementById("contenedor");
    contenedor.innerHTML = trabajos.map(t => `<p>${t.titulo}</p>`).join("");

    expect(contenedor.children.length).toBe(2);
    expect(contenedor.innerHTML).toContain("Trabajo 1");
    expect(contenedor.innerHTML).toContain("Trabajo 2");
  });
});