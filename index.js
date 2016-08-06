const express = require('express')
const nwb = require('nwb/express')
const proxy = require('http-proxy-middleware')
const app = express()

app.use(proxy(['**', '!**/app.js'], { target: 'http://localhost:3000' }))

app.use(nwb(express, {
  autoInstall: true,
  entry: 'client/src/index.js'
}))

app.listen(8000, 'localhost', (err) => {
  if (err) {
    console.error('error starting server:')
    console.error(err.stack)
    process.exit(1)
  }

  console.log('server listening at http://localhost:8000')
})
