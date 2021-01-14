function algo () {
  const dbName = db.databaseName
  // Try creating collection, grab old one if it's already there
  let collection
  try {
    collection = await db.createCollection(collectionName, { w: 'majority' })
  } catch (e) {
    collection = db.collection(collectionName)
  }
  // Grab snapshot of existing indexes
  const oldIndexList = await collection.listIndexes().toArray()
  // debug({dbName, collectionName, oldIndexList, spec})
  // See if we can skip updating the index
  const newIndexExists = oldIndexList.filter(d => d.name === newIndexName).length > 0
  if (newIndexExists) return debug(`index ${dbName}.${collectionName}.${newIndexName} is up-to-date`)
  // Otherwise, drop the old indicies and then create a new one
  return Promise
    .all(dropOldIndicies(db, collectionName, indexPrefix, oldIndexList))
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

function _maintainIndexes () {
  const db = await db()
  const systems = await db.collection('systems').find({}, { name: 1 }).toArray()
  return Promise.all(systems.map(async system => {
    const cdb = await customerDB(system._id)
    return maintainSingleIndex(cdb, collectionName, indexPrefix, newIndexName, spec, options)
  }))
}

export function maintainIndexes (collectionName, indexVersion, spec, options) {
  debug('mantainIndex for collection: ', collectionName)
    _maintainIndexes()  
      .then()
      .catch()
  }
}