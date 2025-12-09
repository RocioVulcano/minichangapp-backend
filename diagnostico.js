import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import dotenv from 'dotenv';

console.log('=== DIAGNÓSTICO COMPLETO ===\n');

// 1. Verificar ubicación actual
console.log('1. Directorio actual:', process.cwd());

// 2. Verificar que .env existe
const envPath = resolve(process.cwd(), '.env');
console.log('2. Path del .env:', envPath);
console.log('3. ¿Existe .env?:', existsSync(envPath));

if (existsSync(envPath)) {
  // 3. Leer contenido del .env manualmente
  const envContent = readFileSync(envPath, 'utf8');
  console.log('4. Contenido del .env:');
  console.log(envContent);
  console.log('');
}

// 4. Intentar cargar con dotenv
console.log('5. Intentando cargar dotenv...');
const result = dotenv.config();

if (result.error) {
  console.log('ERROR:', result.error);
} else {
  console.log('SUCCESS - Variables cargadas:', Object.keys(result.parsed || {}));
}

// 5. Verificar process.env
console.log('\n6. Variables en process.env:');
console.log('   SUPABASE_URL:', process.env.SUPABASE_URL || '(NO EXISTE)');
console.log('   SUPABASE_KEY:', process.env.SUPABASE_KEY ? '(EXISTE)' : '(NO EXISTE)');
console.log('   NODE_ENV:', process.env.NODE_ENV || '(NO EXISTE)');
