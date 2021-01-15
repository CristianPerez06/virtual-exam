const { ApolloError } = require('apollo-server-express')
const { ObjectId } = require('bson')
const moment = require('moment')
const { BACKEND_ERRORS } = require('../../utilities/constants')
const { prepSingleResultForUser, prepMultipleResultsForUser } = require('../../utilities/prepResults')
const { maintainIndex } = require('../../indexer')

const debug = require('debug')('virtual-exam:course-resolver')

const init = () => {
  maintainIndex({
    shared: true,
    collectionName: 'courses',
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
    getCourse: async (parent, args, context) => {
      debug('Running getCourse query with params:', args)

      // Params
      const { id } = args

      // Collection
      const collection = context.db.collection('courses')

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
    listCourses: async (parent, args, context) => {
      debug('Running listCourses query with params:', args)

      // Params
      const { q, offset = 0, limit = 100 } = args

      // Collection
      const collection = context.db.collection('courses')

      // Query
      const searchByValue = q && q.length > 2
      const query = {
        ...(searchByValue && { $text: { $search: 'Cour' } })
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
    createCourse: async (parent, args, context) => {
      debug('Running createCourse mutation with params:', args)

      // Args
      const { name } = args

      // Collection
      const collection = context.db.collection('courses')

      // Look up for duplicates
      const docWithSameValueExist = await collection.findOne({ name: name })
      if (docWithSameValueExist) { throw new ApolloError(BACKEND_ERRORS.DUPLICATED_ENTITY.message, BACKEND_ERRORS.DUPLICATED_ENTITY.Code) }

      // Query
      const newCourse = { _id: new ObjectId(), name: name, created: moment().toISOString() }

      // Exec
      const response = await collection.insertOne(newCourse, { writeConcern: { w: 'majority' } })

      // Results
      if (response.result.ok !== 1) {
        debug('createCourse error:', response.error.message)
        throw new Error(response.error.message)
      }
      return prepSingleResultForUser(response.ops[0])
    },
    updateCourse: async (parent, args, context) => {
      debug('Running updateCourse mutation with params:', args)

      // Args
      const { id, name } = args

      // Collection
      const collection = context.db.collection('courses')

      // Look up for duplicates
      const docWithSameValueExist = await collection.findOne({ name: name })
      if (docWithSameValueExist) { throw new ApolloError(BACKEND_ERRORS.DUPLICATED_ENTITY.Message, BACKEND_ERRORS.DUPLICATED_ENTITY.Code) }

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
        debug('updateCourse error:', response.lastErrorObject)
        throw new Error(response.lastErrorObject)
      }
      return prepSingleResultForUser(response.value)
    },
    deleteCourse: async (parent, args, context) => {
      debug('Running deleteCourse mutation with params:', args)

      // Args
      const { id } = args

      // Collection
      const collection = context.db.collection('courses')

      // Query
      const query = { _id: new ObjectId(id) }

      // Exec
      const { result } = await collection.deleteOne(query, { w: 'majority' })

      // Results
      if (result && result.n === 1 && result.ok === 1) {
        return { done: true }
      } else {
        debug('deleteCourse error:', BACKEND_ERRORS.DELETE_FAILED.Code)
        throw new Error(BACKEND_ERRORS.DELETE_FAILED.Code)
      }
    }
  }
}

module.exports = {
  resolver
}
