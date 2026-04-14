/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      tsconfig: {
        // Allow compiling files outside src/ (i.e. tests/)
        rootDir: ".",
        resolveJsonModule: true,
      },
    }],
  },
};
