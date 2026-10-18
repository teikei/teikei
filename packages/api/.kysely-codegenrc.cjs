// Same connection db/knexfile.js migrates, so codegen reads the migrated schema.
// CommonJS because kysely-codegen loads its config synchronously.
module.exports = { url: require('./config/default.json').postgres.connection }
