const { ApolloError } = require('apollo-server-express')
const { ObjectId } = require('bson')
const moment = require('moment')
const { BACKEND_ERRORS } = require('../../utilities/constants')
const { prepSingleResultForUser, prepMultipleResultsForUser } = require('../../utilities/prepResults')
const { maintainIndex } = require('../../indexer')

const debug = require('debug')('virtual-exam:unit-resolver')

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
      const { q, offset = 0, limit = 100 } = args

      // Collection
      const collection = context.db.collection('units')

      // Query
      const searchByValue = q && q.length > 2
      const query = {
        ...(searchByValue && { $text: { $search: 'Uni' } })
      }

      // Exec
      const cursor = collection.find(query)
      const docs = await cursor
        // .sort(sort)
        .skip(offset)
        .limit(limit)
        .toArray()

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
      if (docWithSameName && docWithSameName.courseId === courseId) {
        throw new ApolloError(BACKEND_ERRORS.DUPLICATED_ENTITY.Message, BACKEND_ERRORS.DUPLICATED_ENTITY.Code)
      }

      // Query
      const newUnit = {
        _id: new ObjectId(),
        name: name,
        courseId: courseId,
        created: moment().toISOString()
      }

      // Exec
      const response = await collection.insertOne(newUnit, { writeConcern: { w: 'majority' } })

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
      if (docWithSameName && docWithSameName.courseId === courseId) {
        throw new ApolloError(BACKEND_ERRORS.DUPLICATED_ENTITY.Message, BACKEND_ERRORS.DUPLICATED_ENTITY.Code)
      }

      // Query
      const update = {
        $set: {
          name,
          updated: moment().toISOString()
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
        debug('deleteUnit error:', BACKEND_ERRORS.DELETE_FAILED.Code)
        throw new Error(BACKEND_ERRORS.DELETE_FAILED.Code)
      }
    }
  }
}

module.exports = {
  resolver
}
