import dotenv from 'dotenv';

// Cargar dotenv
dotenv.config();

console.log('✅ Dotenv cargado');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'EXISTE' : 'NO EXISTE');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'EXISTE' : 'NO EXISTE');

// Importar app DESPUÉS de cargar dotenv usando dynamic import
const { default: app } = await import('./app.js');

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('\n🚀 ============================================');
    console.log('🚀 Servidor corriendo en http://localhost:' + PORT);
    console.log('🚀 ============================================\n');
  });
}

export default app;