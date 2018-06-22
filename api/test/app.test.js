const assert = require('assert')
const rp = require('request-promise')
const url = require('url')
const app = require('../src/app')

const port = app.get('port') || 3030
const getUrl = pathname =>
  url.format({
    hostname: app.get('host') || 'localhost',
    protocol: 'http',
    port,
    pathname
  })

describe('Feathers application tests', () => {
  beforeAll(done => {
    this.server = app.listen(port)
    this.server.once('listening', () => done())
  })

  afterAll(done => {
    this.server.close(done)
  })

  it('starts and shows the index page', () =>
    rp(getUrl()).then(body => assert.ok(body.indexOf('<html>') !== -1)))

  describe('404', () => {
    it('shows a 404 HTML page', () =>
      rp({
        url: getUrl('path/to/nowhere'),
        headers: {
          Accept: 'text/html'
        }
      }).catch(res => {
        assert.equal(res.statusCode, 404)
        assert.ok(res.error.indexOf('<html>') !== -1)
      }))

    it('shows a 404 JSON error without stack trace', () =>
      rp({
        url: getUrl('path/to/nowhere'),
        json: true
      }).catch(res => {
        assert.equal(res.statusCode, 404)
        assert.equal(res.error.code, 404)
        assert.equal(res.error.message, 'Page not found')
        assert.equal(res.error.name, 'NotFound')
      }))
  })
})
