const assert = require('assert')
const app = require('../../src/app')

describe("'places' service", () => {
  it('registered the service', () => {
    const service = app.service('places')

    assert.ok(service, 'Registered the service')
  })
})
