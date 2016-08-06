const express = require('express')
const nwb = require('nwb/express')
const proxy = require('http-proxy-middleware')
const path = require('path')

const app = express()

app.use(proxy(['**', '!**/app.js', '!/__webpack_hmr'], { target: 'http://localhost:3000' }))

app.use(nwb(express, {
  autoInstall: true,
  entry: path.join(__dirname, 'src/index.js'),
  config: path.join(__dirname, 'nwb.config.js')
}))

app.listen(8000, 'localhost', (err) => {
  if (err) {
    console.error('error starting server:')
    console.error(err.stack)
    process.exit(1)
  }
  console.log('server listening at http://localhost:8000')
})
