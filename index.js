import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// ============================================================
// SELECCIÓN DINÁMICA DE BASE DE DATOS SEGÚN ENTORNO
// ============================================================

const isProd = process.env.NODE_ENV === "production";

let db = null;      // Neon (pg)
let supabase = null; // Supabase (QA)

if (isProd) {
  console.log("🟢 Conectando a NEON (PROD)...");

  db = new Pool({
    connectionString: process.env.DATABASE_URL_PROD,
    ssl: { rejectUnauthorized: false },
  });

} else {
  console.log("🟠 Conectando a SUPABASE (QA)...");

  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
}

// ============================================================
// USUARIOS
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

// POST usuarios
app.post("/usuarios", async (req, res) => {
  const { nombre, email, rol } = req.body;

  // VALIDACIONES
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

// PUT usuarios
app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, email, rol } = req.body;

  try {
    if (isProd) {
      const query = `
        UPDATE usuario 
        SET nombre=$1, email=$2, rol=$3
        WHERE id_usuario=$4
        RETURNING *;
      `;
      const result = await db.query(query, [nombre, email, rol, id]);
      return res.json(result.rows);

    } else {
      const { data, error } = await supabase
        .from("usuario")
        .update({ nombre, email, rol })
        .eq("id_usuario", id)
        .select();

      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    }

  } catch (err) {
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// DELETE usuarios
app.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (isProd) {
      await db.query("DELETE FROM usuario WHERE id_usuario=$1;", [id]);
      return res.json({ message: "Usuario eliminado correctamente" });

    } else {
      const { error } = await supabase
        .from("usuario")
        .delete()
        .eq("id_usuario", id);

      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: "Usuario eliminado correctamente" });
    }

  } catch (err) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

// ============================================================
// TRABAJOS
// ============================================================

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

  } catch (err) {
    res.status(500).json({ error: "Error al obtener trabajos" });
  }
});

app.post("/trabajos", async (req, res) => {
  const { titulo, descripcion, ubicacion, empleador_id } = req.body;

  try {
    if (isProd) {
      const query = `
        INSERT INTO trabajo (titulo, descripcion, ubicacion, empleador_id, fecha_publicado)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *;
      `;
      const result = await db.query(query, [
        titulo, descripcion, ubicacion, empleador_id
      ]);
      return res.status(201).json(result.rows);

    } else {
      const { data, error } = await supabase
        .from("trabajo")
        .insert([{ titulo, descripcion, ubicacion, empleador_id }])
        .select();

      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json(data);
    }

  } catch (err) {
    res.status(500).json({ error: "Error al crear trabajo" });
  }
});

app.put("/trabajos/:id", async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, ubicacion, empleador_id } = req.body;

  try {
    if (isProd) {
      const query = `
        UPDATE trabajo
        SET titulo=$1, descripcion=$2, ubicacion=$3, empleador_id=$4
        WHERE id_trabajo=$5
        RETURNING *;
      `;
      const result = await db.query(query, [
        titulo, descripcion, ubicacion, empleador_id, id
      ]);
      return res.json(result.rows);

    } else {
      const { data, error } = await supabase
        .from("trabajo")
        .update({ titulo, descripcion, ubicacion, empleador_id })
        .eq("id_trabajo", id)
        .select();

      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    }

  } catch (err) {
    res.status(500).json({ error: "Error al actualizar trabajo" });
  }
});

app.delete("/trabajos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (isProd) {
      await db.query("DELETE FROM trabajo WHERE id_trabajo=$1;", [id]);
      return res.json({ message: "Trabajo eliminado correctamente" });

    } else {
      const { error } = await supabase
        .from("trabajo")
        .delete()
        .eq("id_trabajo", id);

      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: "Trabajo eliminado correctamente" });
    }

  } catch (err) {
    res.status(500).json({ error: "Error al eliminar trabajo" });
  }
});

// ============================================================
// POSTULACIONES
// ============================================================

app.get("/postulaciones", async (req, res) => {
  try {
    if (isProd) {
      const query = `
        SELECT
          p.id_postulacion,
          p.mensaje,
          p.oferta_pago,
          p.fecha_postulacion,
          json_build_object(
            'id_usuario', u.id_usuario,
            'nombre', u.nombre
          ) AS usuario,
          json_build_object(
            'id_trabajo', t.id_trabajo,
            'titulo', t.titulo
          ) AS trabajo
        FROM postulacion p
        LEFT JOIN usuario u ON u.id_usuario = p.usuario_id
        LEFT JOIN trabajo t ON t.id_trabajo = p.trabajo_id
        ORDER BY p.id_postulacion ASC;
      `;
      const result = await db.query(query);
      return res.json(result.rows);

    } else {
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
      res.json(data);
    }

  } catch (err) {
    res.status(500).json({ error: "Error al obtener postulaciones" });
  }
});

app.post("/postulaciones", async (req, res) => {
  const { trabajo_id, usuario_id, mensaje, oferta_pago } = req.body;

  try {
    if (isProd) {
      const query = `
        INSERT INTO postulacion (trabajo_id, usuario_id, mensaje, oferta_pago, fecha_postulacion)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *;
      `;
      const result = await db.query(query, [
        trabajo_id, usuario_id, mensaje, oferta_pago
      ]);
      return res.status(201).json(result.rows);

    } else {
      const { data, error } = await supabase
        .from("postulacion")
        .insert([{ trabajo_id, usuario_id, mensaje, oferta_pago }])
        .select();

      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json(data);
    }

  } catch (err) {
    res.status(500).json({ error: "Error al crear postulación" });
  }
});

app.delete("/postulaciones/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (isProd) {
      await db.query("DELETE FROM postulacion WHERE id_postulacion=$1;", [id]);
      return res.json({ message: "Postulación eliminada correctamente" });

    } else {
      const { error } = await supabase
        .from("postulacion")
        .delete()
        .eq("id_postulacion", id);

      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: "Postulación eliminada correctamente" });
    }

  } catch (err) {
    res.status(500).json({ error: "Error al eliminar postulación" });
  }
});

// ============================================================
// SELECT simples
// ============================================================

app.get("/usuarios/select", async (req, res) => {
  if (isProd) {
    const result = await db.query(
      "SELECT id_usuario, nombre FROM usuario ORDER BY nombre ASC;"
    );
    return res.json(result.rows);
  }

  const { data, error } = await supabase
    .from("usuario")
    .select("id_usuario, nombre")
    .order("nombre", { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.get("/trabajos/select", async (req, res) => {
  if (isProd) {
    const result = await db.query(
      "SELECT id_trabajo, titulo FROM trabajo ORDER BY titulo ASC;"
    );
    return res.json(result.rows);
  }

  const { data, error } = await supabase
    .from("trabajo")
    .select("id_trabajo, titulo")
    .order("titulo", { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
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

// ============================================================
// SERVER
// ============================================================

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
  });
}

export default app;
