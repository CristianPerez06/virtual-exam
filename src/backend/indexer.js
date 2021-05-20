const { virtualExamDb } = require('./middleware/mongo')

const debug = require('debug')('virtual-exam:indexer')

const dropOldIndexes = (db, collectionName, indexPrefix, oldIndexList) => {
  const dbName = db.databaseName
  const collection = db.collection(collectionName)

  return oldIndexList.map(oldIndex => {
    if (oldIndex.name.startsWith(indexPrefix)) {
      debug(`dropping old index ${dbName}.${collectionName}.${oldIndex.name}`)

      return collection.dropIndex(oldIndex.name)
        .then(result => debug(`successfully dropped ${dbName}.${collectionName}.${oldIndex.name}`, result))
        .catch(err => debug(`error dropping old index ${dbName}.${collectionName}.${oldIndex.name}`, err))
    }
  })
}

const execMaintenance = async (db, collectionName, indexPrefix, newIndexName, spec, options) => {
  const dbName = db.databaseName

  let collection
  try {
    collection = await db.createCollection(collectionName, { w: 'majority' })
  } catch (e) {
    collection = db.collection(collectionName)
  }

  // Grab snapshot of existing indexes
  const oldIndexList = await collection.listIndexes().toArray()

  // See if we can skip updating the index
  const newIndexExists = oldIndexList.filter(d => d.name === newIndexName).length > 0
  if (newIndexExists) return debug(`index ${dbName}.${collectionName}.${newIndexName} is up-to-date`)

  // Otherwise, drop the old indicies and then create a new one
  return Promise
    .all(dropOldIndexes(db, collectionName, indexPrefix, oldIndexList))
    .then(_ => {
      // Create the index with some specific options overridden
      const newOptions = Object.assign(
        Object.assign({}, options),
        { name: newIndexName, key: spec, background: true }
      )

      debug(`creating new index ${dbName}.${collectionName}.${newIndexName}`, newOptions)
      return collection
        .createIndexes([newOptions])
        .then(result => debug(`created index ${dbName}.${collectionName}.${newIndexName}`, collectionName, newOptions, result))
        .catch(err => debug('error creating index', newOptions, 'error:', err))
    })
}

const _maintainIndex = async ({ collectionName, indexVersion, spec, options }) => {
  if (!options.name) throw new Error('index missing name')

  const indexPrefix = options.name
  const newIndexName = `${options.name}_v${indexVersion}`

  const db = await virtualExamDb()
  return execMaintenance(db, collectionName, indexPrefix, newIndexName, spec, options)
}

const maintainIndex = async ({ collectionName, indexVersion, spec, options, shared }) => {
  debug('maintainIndex', { collectionName })

  _maintainIndex({ collectionName, indexVersion, spec, options })
    .then(result => debug('maintainIndex successfully executed'))
    .catch(function (e) { throw e })
}

module.exports = {
  maintainIndex
}