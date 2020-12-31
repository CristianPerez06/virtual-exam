const { ObjectId } = require('bson')
const moment = require('moment')
const { ERROR_MESSAGES } = require('../../utilities/constants')
const { prepSingleResultForUser } = require('../../utilities/prepResults')

const debug = require('debug')('virtual-exam:course-resolver')

const resolver = {
  Query: {
    getCourse: async (parent, args, context) => {
      try {
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
      } catch (e) {
        debug('getCourse error:', e.message)
        throw new Error(e.message)
      }
    }
  },
  Mutation: {
    createCourse: async (parent, args, context) => {
      try {
        debug('Running createCourse mutation with params:', args)

        // Args
        const { name } = args

        // Collection
        const collection = context.db.collection('courses')

        // Look up for duplicates
        const docWithSameValueExist = await collection.findOne({ name: name })
        if (docWithSameValueExist) { throw new Error(ERROR_MESSAGES.DUPLICATED_DOC) }

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
      } catch (e) {
        debug('createCourse error:', e.message)
        throw new Error(e.message)
      }
    },
    updateCourse: async (parent, args, context) => {
      try {
        debug('Running updateCourse mutation with params:', args)

        // Args
        const { id, name } = args

        // Collection
        const collection = context.db.collection('courses')

        // Look up for duplicates
        const docWithSameValueExist = await collection.findOne({ name: name })
        if (docWithSameValueExist) { throw new Error(ERROR_MESSAGES.DUPLICATED_DOC) }

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
      } catch (e) {
        debug('updateCourse error:', e.message)
        throw new Error(e.message)
      }
    }
  }
}

module.exports = {
  resolver
}
