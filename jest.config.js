module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@public/(.*)$': '<rootDir>/src/public/$1',
    '^@internal/(.*)$': '<rootDir>/src/internal/$1'
  }
};
