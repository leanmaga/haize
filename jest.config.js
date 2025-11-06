/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // ✅ CORREGIDO: moduleNameMapper (no moduleNameMapping)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // ✅ Apunta a src/
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
    "^.+\\.(css|sass|scss)$": "identity-obj-proxy",
    "^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i":
      "<rootDir>/__mocks__/fileMock.js",
  },

  // ✅ CORREGIDO: Coverage para tu estructura src/
  collectCoverageFrom: [
    "src/app/**/*.{js,jsx}",
    "src/components/**/*.{js,jsx}",
    "src/context/**/*.{js,jsx}",
    "src/helpers/**/*.{js,jsx}",
    "src/hooks/**/*.{js,jsx}",
    "src/lib/**/*.{js,jsx}",
    "src/middleware/**/*.{js,jsx}",
    "src/models/**/*.{js,jsx}",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!**/public/**",
    "!**/*.test.{js,jsx}",
    "!**/*.spec.{js,jsx}",
    "!**/jest.config.js",
    "!**/jest.setup.js",
    "!**/next.config.js",
    "!**/tailwind.config.js",
    "!**/postcss.config.mjs",
    "!**/eslint.config.mjs",
    "!**/test-email-local.js",
  ],

  coverageReporters: ["text", "lcov", "html"],
  coverageDirectory: "coverage",

  testMatch: [
    "**/__tests__/**/*.(test|spec).{js,jsx}",
    "**/*.(test|spec).{js,jsx}",
  ],

  transform: {
    "^.+\\.(js|jsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },

  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],

  // ✅ Configuración adicional para CI
  verbose: process.env.CI !== "true",
  collectCoverage: process.env.CI === "true",
  maxWorkers: process.env.CI === "true" ? 2 : "50%",

  // ✅ Module directories para resolver imports
  moduleDirectories: ["node_modules", "<rootDir>/", "<rootDir>/src/"],
};

module.exports = config;
