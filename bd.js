// db.js
import pkg from "pg";
const { Pool } = pkg;
import { createClient } from "@supabase/supabase-js";

let db = null;

// ⭐ Producción → usar Neon
if (process.env.NODE_ENV === "production") {
  console.log("🔌 Conectando a Neon (producción)...");

  db = new Pool({
    connectionString: process.env.DATABASE_URL_PROD,
    ssl: { rejectUnauthorized: false }
  });

// ⭐ Dev/QA/Test → usar Supabase
} else {
  console.log("🔌 Conectando a Supabase (dev/qa/test)...");

  db = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
}

export default db;
