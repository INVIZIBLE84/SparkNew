module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.js'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
};