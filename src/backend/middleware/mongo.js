require('dotenv').config()
const { MongoClient } = require('mongodb')
const variables = require('../variables')
const debug = require('debug')('virtual-exam:mongo')

const connUrl = variables.connection || variables.defaultConnection
const dbName = variables.db

const dbPromise = MongoClient.connect(
  connUrl,
  { useUnifiedTopology: true }
)

/**
 * Returns a promise for the database
 */
async function virtualExamDb () {
  const client = await dbPromise
  const db = client.db(dbName)
  return db
}

/**
 * Middleware that populates req.db
 */
function loadDb (req, res, next) {
  virtualExamDb()
    .then(db => {
      debug(`Connected succesfully to database: ${db.databaseName}`)
      req.db = db
      next()
    })
    .catch(next)
}

module.exports = {
  loadDb,
  virtualExamDb
}
