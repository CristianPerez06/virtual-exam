const { MongoClient } = require('mongodb')
const debug = require('debug')('virtual-exam:mongo')

const CONNECTION_URL = 'mongodb://localhost:27017'
const DEFAULT_MONGO_DB = 'virtual-exam'

const dbPromise = MongoClient.connect(
  CONNECTION_URL,
  { useUnifiedTopology: true }
)

/**
 * Returns a promise for the database
 */
async function virtualExamDb () {
  const client = await dbPromise
  const db = client.db(process.env.DB || DEFAULT_MONGO_DB)
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
