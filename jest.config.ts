export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  rootDir: ".",
  moduleNameMapper: {
    "^utils/(.*)$": "<rootDir>/src/utils/$1",
    "^framework/(.*)$": "<rootDir>/src/framework/$1",
    "^modules/(.*)$": "<rootDir>/src/modules/$1",
    "^src/(.*)$": "<rootDir>/src/$1",
  },
};
