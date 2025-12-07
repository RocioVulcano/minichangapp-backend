import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import pkg from "pg";
import dotenv from "dotenv";

// ============================================================
// CARGA DE VARIABLES DE ENTORNO SEGÚN ENTORNO
// ============================================================
if (process.env.NODE_ENV === "test") {
  console.log("🔧 Cargando variables desde .env.test");
  dotenv.config({ path: ".env.test" });
} else {
  dotenv.config();
}

// ============================================================
// INICIALIZACIÓN GENERAL
// ============================================================
const { Pool } = pkg;

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const isProd = process.env.NODE_ENV === "production";

let db = null;
let supabase = null;

// ============================================================
// CONEXIÓN A BASE DE DATOS
// ============================================================
if (isProd) {
  console.log("🟢 Conectando a NEON (PROD)...");

  db = new Pool({
    connectionString: process.env.DATABASE_URL_PROD,
    ssl: { rejectUnauthorized: false },
  });

} else {
  console.log("🟠 Conectando a SUPABASE (QA/Test)...");
  console.log("➡ SUPABASE_URL:", process.env.SUPABASE_URL ?? "(VACÍO)");
  console.log("➡ SUPABASE_KEY:", process.env.SUPABASE_KEY ? "(CARGADA)" : "(VACÍA)");

  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
}

// ============================================================
// ===============   RUTAS DE USUARIOS   =======================
// ============================================================

// GET usuarios
app.get("/usuarios", async (req, res) => {
  try {
    if (isProd) {
      const result = await db.query("SELECT * FROM usuario ORDER BY id_usuario ASC;");
      return res.json(result.rows);
    }

    const { data, error } = await supabase.from("usuario").select("*");
    if (error) return res.status(400).json({ error: error.message });

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: "Error interno en /usuarios" });
  }
});

// POST crear usuario
app.post("/usuarios", async (req, res) => {
  const { nombre, email, rol } = req.body;

  // Validaciones
  if (!nombre || !email || !rol) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }
  if (nombre.trim().length < 2) {
    return res.status(400).json({ error: "El nombre debe tener al menos 2 caracteres." });
  }
  if (/\d/.test(nombre)) {
    return res.status(400).json({ error: "El nombre no puede contener números." });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "El email no tiene un formato válido." });
  }
  const genericos = ["usuario", "empleado", "test", "admin", "candidato"];
  if (genericos.includes(nombre.trim().toLowerCase())) {
    return res.status(400).json({ error: "El nombre ingresado no es válido." });
  }

  try {
    if (isProd) {
      const query = `
        INSERT INTO usuario (nombre, email, rol, fecha_creacion)
        VALUES ($1, $2, $3, NOW())
        RETURNING *;
      `;
      const result = await db.query(query, [nombre, email, rol]);
      return res.status(201).json(result.rows);

    } else {
      const { data, error } = await supabase
        .from("usuario")
        .insert([{ nombre, email, rol }])
        .select();

      if (error) return res.status(400).json({ error: error.message });
      return res.status(201).json(data);
    }

  } catch (err) {
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

// PUT actualizar usuario
app.put("/usuarios/:id", async (req, res) => {
  const id = req.params.id;
  const { nombre, email, rol } = req.body;

  try {
    if (isProd) {
      const query = `
        UPDATE usuario
        SET nombre = $1, email = $2, rol = $3
        WHERE id_usuario = $4
        RETURNING *;
      `;
      const result = await db.query(query, [nombre, email, rol, id]);
      if (!result.rows.length) return res.status(404).json({ error: "Usuario no encontrado" });

      return res.json(result.rows);

    } else {
      const { data, error } = await supabase
        .from("usuario")
        .update({ nombre, email, rol })
        .eq("id_usuario", id)
        .select();

      if (error) return res.status(400).json({ error: error.message });
      if (!data.length) return res.status(404).json({ error: "Usuario no encontrado" });

      return res.json(data);
    }

  } catch {
    res.status(500).json({ error: "Error actualizando usuario" });
  }
});

// DELETE eliminar usuario
app.delete("/usuarios/:id", async (req, res) => {
  const id = req.params.id;

  try {
    if (isProd) {
      const query = `
        DELETE FROM usuario
        WHERE id_usuario = $1
        RETURNING *;
      `;
      const result = await db.query(query, [id]);
      if (!result.rows.length) return res.status(404).json({ error: "Usuario no encontrado" });

      return res.json({ message: "Usuario eliminado correctamente" });

    } else {
      const { error } = await supabase
        .from("usuario")
        .delete()
        .eq("id_usuario", id);

      if (error) return res.status(400).json({ error: error.message });

      return res.json({ message: "Usuario eliminado correctamente" });
    }

  } catch {
    res.status(500).json({ error: "Error eliminando usuario" });
  }
});

// ============================================================
// ===============   RUTAS DE TRABAJOS   =======================
// ============================================================

// GET trabajos
app.get("/trabajos", async (req, res) => {
  try {
    if (isProd) {
      const query = `
        SELECT 
          t.id_trabajo,
          t.titulo,
          t.descripcion,
          t.ubicacion,
          t.fecha_publicado,
          json_build_object(
            'id_usuario', u.id_usuario,
            'nombre', u.nombre,
            'email', u.email
          ) AS empleador
        FROM trabajo t
        LEFT JOIN usuario u ON u.id_usuario = t.empleador_id
        ORDER BY t.id_trabajo ASC;
      `;
      const result = await db.query(query);
      return res.json(result.rows);

    } else {
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
      res.json(data);
    }

  } catch {
    res.status(500).json({ error: "Error al obtener trabajos" });
  }
});

// POST crear trabajo
app.post("/trabajos", async (req, res) => {
  const { titulo, descripcion, ubicacion, empleador_id } = req.body;

  try {
    const { data, error } = await supabase
      .from("trabajo")
      .insert([{ titulo, descripcion, ubicacion, empleador_id }])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json(data);

  } catch {
    res.status(500).json({ error: "Error creando trabajo" });
  }
});

// ============================================================
// ============   RUTAS DE POSTULACIONES   =====================
// ============================================================

// GET postulaciones
app.get("/postulaciones", async (req, res) => {
  try {
    const { data, error } = await supabase.from("postulacion").select("*");
    if (error) return res.status(400).json({ error: error.message });

    res.json(data);

  } catch {
    res.status(500).json({ error: "Error al obtener postulaciones" });
  }
});

// POST crear postulacion
app.post("/postulaciones", async (req, res) => {
  const { trabajo_id, usuario_id, mensaje, oferta_pago } = req.body;

  try {
    const { data, error } = await supabase
      .from("postulacion")
      .insert([{ trabajo_id, usuario_id, mensaje, oferta_pago }])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json(data);

  } catch {
    res.status(500).json({ error: "Error creando postulación" });
  }
});

// ============================================================
// HOME & HEALTH
// ============================================================
app.get("/", (req, res) => {
  res.send(`
    <h1>🚀 MiniChangApp Backend desplegado correctamente</h1>
    <p>Entorno: ${process.env.NODE_ENV}</p>
  `);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
