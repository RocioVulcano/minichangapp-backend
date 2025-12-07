import app from "./app.js";

const PORT = process.env.PORT || 3000;

// ❗ NO LEVANTAR SERVIDOR EN TESTS
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
  });
}

export default app; // opcional
