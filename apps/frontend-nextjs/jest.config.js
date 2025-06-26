/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require("next/jest");

// Create a Jest config that mimics the Next.js bundler and TS handling
const createJestConfig = nextJest({
  dir: "./", // path to the Next.js app
});

/** @type {import('jest').Config} */
module.exports = createJestConfig({
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
    },
  },
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "<rootDir>/src/**/*.(test|spec).(ts|tsx)",
    "<rootDir>/tests/**/*.(test|spec).(ts|tsx)",
  ],
});
