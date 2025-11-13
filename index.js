import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// ===================
// CONEXION CON DB: Supabase
// ===================
const SUPABASE_URL = "https://xditqomizrdelarcwtus.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaXRxb21penJkZWxhcmN3dHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjg0MzcsImV4cCI6MjA3NjkwNDQzN30.GccmhKcdmh84ue1knO94NCAfhRi7gKpuKl_oO6XhrEg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===================================================
// USUARIOS
// ===================================================
app.get("/usuarios", async (req, res) => {
  const { data, error } = await supabase.from("usuario").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

app.post("/usuarios", async (req, res) => {
  const { nombre, email, rol } = req.body;

  // =====================================
  // VALIDACIONES REQUERIDAS POR LOS TESTS
  // =====================================

  // 1) Campos obligatorios
  if (!nombre || !email || !rol) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  // 2) Nombre muy corto
  if (nombre.trim().length < 2) {
    return res.status(400).json({ error: "El nombre debe tener al menos 2 caracteres." });
  }

  // 3) Nombre con números
  if (/\d/.test(nombre)) {
    return res.status(400).json({ error: "El nombre no puede contener números." });
  }

  // 4) Email inválido
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "El email no tiene un formato válido." });
  }

  // 5) Nombre genérico prohibido
  const genericos = ["usuario", "empleado", "test", "admin", "candidato"];
  if (genericos.includes(nombre.trim().toLowerCase())) {
    return res.status(400).json({ error: "El nombre ingresado no es válido." });
  }

  // =====================================
  // CREAR USUARIO SI TODO ES VÁLIDO
  // =====================================
  const { data, error } = await supabase
    .from("usuario")
    .insert([{ nombre, email, rol }])
    .select();

  if (error) return res.status(400).json({ error: error.message });

  return res.status(201).json(data); // creado correctamente
});

app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, email, rol } = req.body;

  const { data, error } = await supabase
    .from("usuario")
    .update({ nombre, email, rol })
    .eq("id_usuario", id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

app.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("usuario").delete().eq("id_usuario", id);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: "Usuario eliminado correctamente" });
});

// ===================================================
// TRABAJOS
// ===================================================
app.get("/trabajos", async (req, res) => {
  const { data, error } = await supabase
    .from("trabajo")
    .select(`
      id_trabajo,
      titulo,
      descripcion,
      ubicacion,
      fecha_publicado,
      empleador:empleador_id (id_usuario, nombre, email)
    `);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

app.post("/trabajos", async (req, res) => {
  const { titulo, descripcion, ubicacion, empleador_id } = req.body;

  const { data, error } = await supabase
    .from("trabajo")
    .insert([{ titulo, descripcion, ubicacion, empleador_id }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

app.put("/trabajos/:id", async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, ubicacion, empleador_id } = req.body;

  const { data, error } = await supabase
    .from("trabajo")
    .update({ titulo, descripcion, ubicacion, empleador_id })
    .eq("id_trabajo", id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

app.delete("/trabajos/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("trabajo").delete().eq("id_trabajo", id);
  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json({ message: "Trabajo eliminado correctamente" });
});

// ===================================================
// POSTULACIONES
// ===================================================
app.get("/postulaciones", async (req, res) => {
  const { data, error } = await supabase
    .from("postulacion")
    .select(`
      id_postulacion,
      mensaje,
      oferta_pago,
      fecha_postulacion,
      usuario:usuario_id (id_usuario, nombre),
      trabajo:trabajo_id (id_trabajo, titulo)
    `);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

app.post("/postulaciones", async (req, res) => {
  const { trabajo_id, usuario_id, mensaje, oferta_pago } = req.body;

  const { data, error } = await supabase
    .from("postulacion")
    .insert([{ trabajo_id, usuario_id, mensaje, oferta_pago }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

app.delete("/postulaciones/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("postulacion").delete().eq("id_postulacion", id);
  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json({ message: "Postulación eliminada correctamente" });
});

// ===================================================
// RUTAS AUXILIARES
// ===================================================
app.get("/usuarios/select", async (req, res) => {
  const { data, error } = await supabase
    .from("usuario")
    .select("id_usuario, nombre")
    .order("nombre", { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.get("/trabajos/select", async (req, res) => {
  const { data, error } = await supabase
    .from("trabajo")
    .select("id_trabajo, titulo")
    .order("titulo", { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ===================================================
// HOME (para Azure WebApp)
// ===================================================
app.get("/", (req, res) => {
  res.send(`
    <h1>🚀 MiniChangApp Backend desplegado correctamente</h1>
    <p>Entorno: ${process.env.NODE_ENV || "producción"}</p>
    <ul>
      <li><a href="/usuarios">/usuarios</a></li>
      <li><a href="/trabajos">/trabajos</a></li>
      <li><a href="/postulaciones">/postulaciones</a></li>
      <li><a href="/health">/health</a></li>
    </ul>
  `);
});

// ===================================================
// HEALTH CHECK
// ===================================================
app.get("/health", (req, res) => {
  console.log("Health check recibido");
  res.json({ status: "ok" });
});

// ===================================================
// SERVIDOR
// ===================================================
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
  });
}

export default app;
