process.env.PORT = 8001;
require('./start.js')

const express = require('express')
const proxy = require('http-proxy-middleware')
const path = require('path')

const app = express()

app.use(proxy([
  '**',
  '!/static/**',
  '!/sockjs-node/**'
], {
    target: 'http://localhost:3000',
    changeOrigin: true
  }
))

app.use(proxy([
  '/static/**',
], {
    target: 'http://localhost:8001',
    changeOrigin: true
  }
))

app.use(proxy([
  '/sockjs-node/**'
], {
    target: 'http://localhost:8001',
    changeOrigin: true,
    ws: true
  }
))

app.listen(8000, 'localhost', (err) => {
  if (err) {
    console.error('error starting server:')
    console.error(err.stack)
    process.exit(1)
  }
  console.log('server listening at http://localhost:8000')
})
