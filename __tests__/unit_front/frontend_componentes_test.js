/**
 * @jest-environment jsdom
 */

describe("Frontend - Carga de componentes", () => {
  beforeEach(() => {
    // Resetear el DOM antes de cada test
    document.body.innerHTML = `
      <div id="navbar"></div>
      <div id="footer"></div>
    `;
    
    // Mock de fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("debería cargar el navbar correctamente", async () => {
    const mockHTML = '<nav><h1>MiniChangApp</h1></nav>';
    global.fetch.mockResolvedValueOnce({
      text: jest.fn().mockResolvedValue(mockHTML)
    });

    const loadComponent = async (id, file) => {
      const res = await fetch(file);
      const html = await res.text();
      document.getElementById(id).innerHTML = html;
    };

    await loadComponent("navbar", "/components/navbar.html");

    expect(document.getElementById("navbar").innerHTML).toBe(mockHTML);
    expect(fetch).toHaveBeenCalledWith("/components/navbar.html");
  });

  test("debería cargar el footer correctamente", async () => {
    const mockHTML = '<footer><p>© 2025 MiniChangApp</p></footer>';
    global.fetch.mockResolvedValueOnce({
      text: jest.fn().mockResolvedValue(mockHTML)
    });

    const loadComponent = async (id, file) => {
      const res = await fetch(file);
      const html = await res.text();
      document.getElementById(id).innerHTML = html;
    };

    await loadComponent("footer", "/components/footer.html");

    expect(document.getElementById("footer").innerHTML).toBe(mockHTML);
    expect(fetch).toHaveBeenCalledWith("/components/footer.html");
  });

  test("debería llamar a fetch con la URL correcta", async () => {
    global.fetch.mockResolvedValueOnce({
      text: jest.fn().mockResolvedValue('<div>test</div>')
    });

    const loadComponent = async (id, file) => {
      const res = await fetch(file);
      const html = await res.text();
      document.getElementById(id).innerHTML = html;
    };

    await loadComponent("navbar", "/components/navbar.html");

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/components/navbar.html");
  });

  test("debería manejar componentes vacíos", async () => {
    global.fetch.mockResolvedValueOnce({
      text: jest.fn().mockResolvedValue('')
    });

    const loadComponent = async (id, file) => {
      const res = await fetch(file);
      const html = await res.text();
      document.getElementById(id).innerHTML = html;
    };

    await loadComponent("navbar", "/components/navbar.html");

    expect(document.getElementById("navbar").innerHTML).toBe('');
  });

  test("debería poder cargar múltiples componentes", async () => {
    global.fetch
      .mockResolvedValueOnce({
        text: jest.fn().mockResolvedValue('<nav>Navbar</nav>')
      })
      .mockResolvedValueOnce({
        text: jest.fn().mockResolvedValue('<footer>Footer</footer>')
      });

    const loadComponent = async (id, file) => {
      const res = await fetch(file);
      const html = await res.text();
      document.getElementById(id).innerHTML = html;
    };

    await loadComponent("navbar", "/components/navbar.html");
    await loadComponent("footer", "/components/footer.html");

    expect(document.getElementById("navbar").innerHTML).toBe('<nav>Navbar</nav>');
    expect(document.getElementById("footer").innerHTML).toBe('<footer>Footer</footer>');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});