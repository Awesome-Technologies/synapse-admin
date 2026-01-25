import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "jest-fixed-jsdom",
  collectCoverage: true,
  coveragePathIgnorePatterns: ["node_modules", "dist"],
  coverageDirectory: "<rootDir>/coverage/",
  coverageReporters: ["html", "text", "text-summary", "cobertura"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  setupFilesAfterEnv: ["<rootDir>/src/jest.setup.ts"],
};

export default config;