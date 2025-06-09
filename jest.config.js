module.exports = {
  // Look for test files in these directories
  roots: ['<rootDir>/lib'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/lib/tests/setup-env.js'],

  // Optional: if you want to collect coverage
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'lib/**/*.js',
    '!lib/**/*.test.js'
  ]
};