const { resolve } = require('path')
const testContainerPreset = require('@trendyol/jest-testcontainers/jest-preset')

module.exports = Object.assign(testContainerPreset, {
  testEnvironment: resolve(__dirname, './jest.environment.js'),
})
