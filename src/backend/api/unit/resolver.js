const { ApolloError } = require('apollo-server-express')
const { ObjectId } = require('bson')
const { BACKEND_ERRORS } = require('../../utilities/constants')
const { prepSingleResultForUser, prepMultipleResultsForUser } = require('../../utilities/prepResults')
const { maintainIndex } = require('../../indexer')

const debug = require('debug')('virtual-exam:units-resolver')

const init = () => {
  maintainIndex({
    shared: true,
    collectionName: 'units',
    indexVersion: 1,
    spec: { 'name.text': 'text' },
    options: {
      // weights: { 'name.text': 100 },
      name: 'search_index'
    }
  })
}

init()

const resolver = {
  Query: {
    getUnit: async (parent, args, context) => {
      debug('Running getUnit query with params:', args)

      // Params
      const { id } = args

      // Collection
      const collection = context.db.collection('units')

      // Query
      const query = {
        _id: new ObjectId(id)
      }

      // Exec
      const docs = await collection
        .find(query)
        .toArray()

      // Results
      return prepSingleResultForUser(docs[0])
    },
    listUnits: async (parent, args, context) => {
      debug('Running listUnits query with params:', args)

      // Params
      const { courseId } = args

      // Collection
      const collection = context.db.collection('units')

      // Aggregate
      let aggregate = [{
        $match: {
          disabled: { $not: { $eq: true } }
        }
      }]

      if (courseId) {
        aggregate = [
          ...aggregate,
          {
            $match: {
              courseId: new ObjectId(courseId)
            }
          }
        ]
      }
      debug('Aggregate: ', aggregate)

      // Exec
      const docs = await collection.aggregate(aggregate).toArray()

      // Results
      return prepMultipleResultsForUser(docs)
    }
  },
  Mutation: {
    createUnit: async (parent, args, context) => {
      debug('Running createUnit mutation with params:', args)

      // Args
      const { name, courseId } = args

      // Collection
      const collection = context.db.collection('units')

      // Look up for duplicates
      const docWithSameName = await collection.findOne({ name: name })
      const isDuplicated = docWithSameName &&
        docWithSameName.courseId.toString() === courseId &&
          docWithSameName.disabled !== true
      if (isDuplicated) {
        throw new ApolloError(BACKEND_ERRORS.DUPLICATED_ENTITY)
      }

      // Query
      const newItem = {
        _id: new ObjectId(),
        name: name,
        courseId: new ObjectId(courseId),
        created: new Date().toISOString()
      }

      // Exec
      const response = await collection.insertOne(newItem, { writeConcern: { w: 'majority' } })

      // Results
      if (response.result.ok !== 1) {
        debug('createUnit error:', response.error.message)
        throw new Error(response.error.message)
      }
      return prepSingleResultForUser(response.ops[0])
    },
    updateUnit: async (parent, args, context) => {
      debug('Running updateUnit mutation with params:', args)

      // Args
      const { id, name, courseId } = args

      // Collection
      const collection = context.db.collection('units')

      // Look up for duplicates
      const docWithSameName = await collection.findOne({ name: name })
      const isDuplicated = docWithSameName &&
        docWithSameName.courseId.toString() === courseId &&
        docWithSameName.disabled !== true
      if (isDuplicated) {
        throw new ApolloError(BACKEND_ERRORS.DUPLICATED_ENTITY)
      }

      // Query
      const update = {
        $set: {
          name,
          courseId: new ObjectId(courseId),
          updated: new Date().toISOString()
        }
      }

      // Exec
      const response = await collection.findOneAndUpdate({ _id: new ObjectId(id) }, update, { returnOriginal: false, w: 'majority' })

      // Results
      if (response.ok !== 1) {
        debug('updateUnit error:', response.lastErrorObject)
        throw new Error(response.lastErrorObject)
      }
      return prepSingleResultForUser(response.value)
    },
    disableUnit: async (parent, args, context) => {
      debug('Running disableUnit mutation with params:', args)

      // Args
      const { id } = args
      const objUnitId = new ObjectId(id)

      // Collection
      const collection = context.db.collection('units')
      const exercisesCollection = context.db.collection('exercises')

      // Validate related entities
      const findRelatedEntities = [{
        $match: {
          disabled: { $ne: true },
          unitId: objUnitId
        }
      }]
      const exercisesRelated = await exercisesCollection.aggregate(findRelatedEntities).toArray()
      debug('exercisesRelated: ', exercisesRelated)
      if (exercisesRelated.length !== 0) {
        throw new ApolloError(BACKEND_ERRORS.RELATED_ENTITY_EXISTS)
      }

      // Query
      const update = {
        $set: {
          disabled: true,
          updated: new Date().toISOString()
        }
      }

      // Exec
      const response = await collection.findOneAndUpdate({ _id: new ObjectId(id) }, update, { returnOriginal: false, w: 'majority' })

      // Results
      if (response.ok !== 1) {
        debug('disableUnit error:', response.lastErrorObject)
        throw new Error(response.lastErrorObject)
      }
      return prepSingleResultForUser(response.value)
    },
    deleteUnit: async (parent, args, context) => {
      debug('Running deleteUnit mutation with params:', args)

      // Args
      const { id } = args

      // Collection
      const collection = context.db.collection('units')

      // Query
      const query = { _id: new ObjectId(id) }

      // Exec
      const { result } = await collection.deleteOne(query, { w: 'majority' })

      // Results
      if (result && result.n === 1 && result.ok === 1) {
        return { done: true }
      } else {
        debug('deleteUnit error:', BACKEND_ERRORS.DELETE_FAILED)
        throw new Error(BACKEND_ERRORS.DELETE_FAILED)
      }
    }
  }
}

module.exports = {
  resolver
}
