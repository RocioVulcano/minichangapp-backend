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
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!jest.setup.js',
    '!jest.setup.jsdom.js'
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