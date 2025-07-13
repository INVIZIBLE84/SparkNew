jest.config.js:
{
  "testEnvironment": "node",
  "verbose": true
}

src/tests/hello.test.js:
test('hello world!', () => {
  expect(1 + 1).toBe(2);
});