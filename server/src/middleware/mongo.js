const { MongoClient } = require('mongodb')
const debug = require('debug')('virtual-exam:mongo')

// const DEFAULT_CONNECTION_URL = 'mongodb+srv://admin:admin@virtualexam.mqcgh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
const DEFAULT_CONNECTION_URL = 'mongodb://localhost:27017'
const DEFAULT_MONGO_DB = 'virtual-exam'

const connUrl = process.env.CONNECTION || DEFAULT_CONNECTION_URL
const dbName = process.env.DB || DEFAULT_MONGO_DB

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
