const devConfig = require('../config/default.json')
const productionConfig = require('../config/production.json')

const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

module.exports = {
  development: devConfig.postgres,
  production: productionConfig.postgres,
}
