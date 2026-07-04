const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.test.js'],
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'helpers/**/*.js',
    'lib/**/*.js',
    'pages/**/*.js',
    'pages/**/*.jsx',
    'pages/**/*.ts',
    'pages/**/*.tsx',
    '!pages/_app.jsx',
    '!pages/api/**',
  ],
};

module.exports = createJestConfig(customJestConfig);
