// https://jestjs.io/docs/configuration

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: [
        "specs"
    ],
    clearMocks: true,
};