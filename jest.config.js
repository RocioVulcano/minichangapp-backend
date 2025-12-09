// jest.config.js
export default {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'app.js',  // Solo el archivo principal de tu app
    'front/**/*.js',  // Si tenés código productivo en front
    '!front/config.js',  // Excluir config
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/__tests__/**',  // IMPORTANTE: excluir los tests
    '!**/cypress/**',  // IMPORTANTE: excluir cypress
    '!jest.config.js',
    '!jest.setup.js',
    '!jest.setup.jsdom.js',
    '!babel.config.js',
    '!cypress.config.js',
    '!bd.js',
    '!diagnostico.js',
    '!index.js',
    '!supabaseClient.js',
    '!supabaseMocks.js'
  ],
  transform: {},
  // Configuración específica para archivos de frontend
  projects: [
    {
      displayName: 'backend',
      testEnvironment: 'node',
      testMatch: ['**/__tests__/unit_back/**/*.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
    },
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      testMatch: ['**/__tests__/unit_front/**/*.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.jsdom.js']
    }
  ]
};