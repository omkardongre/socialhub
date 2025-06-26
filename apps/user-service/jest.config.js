module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
    },
  },
  moduleNameMapper: {
    '^@libs/events$': '<rootDir>/../../../libs/events',
    '^@libs/events/(.*)$': '<rootDir>/../../../libs/events/$1',
  },
};
