const { ApolloError } = require('apollo-server-express')
const { ObjectId } = require('bson')
const { BACKEND_ERRORS } = require('../../utilities/constants')
const { prepSingleResultForUser, prepMultipleResultsForUser } = require('../../utilities/prepResults')
const { maintainIndex } = require('../../indexer')
const { getValidExercises } = require('./aggregates')

const debug = require('debug')('virtual-exam:exercises-resolver')

const init = () => {
  maintainIndex({
    shared: true,
    collectionName: 'exercises',
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
    getExercise: async (parent, args, context) => {
      debug('Running getExercise query with params:', args)

      // Params
      const { id } = args

      // Collection
      const collection = context.db.collection('exercises')

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
    listExercises: async (parent, args, context) => {
      debug('Running listExercises query with params:', args)

      // Params
      const { courseId, unitId } = args

      // Collection
      const collection = context.db.collection('exercises')

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
      if (unitId) {
        aggregate = [
          ...aggregate,
          {
            $match: {
              unitId: new ObjectId(unitId)
            }
          }
        ]
      }
      debug('Aggregate: ', aggregate)

      // Exec
      const docs = await collection.aggregate(aggregate).toArray()

      // Results
      return prepMultipleResultsForUser(docs)
    },
    listValidExercises: async (parent, args, context) => {
      debug('Running listExercises query with params:', args)

      // Params
      const { courseId } = args
      const objCourseId = new ObjectId(courseId)

      // Collection
      const collection = context.db.collection('exercises')

      // Aggregate
      const aggregate = getValidExercises(objCourseId)
      debug('Aggregate: ', aggregate)

      // Exec
      const docs = await collection.aggregate(aggregate).toArray()

      // Results
      return prepMultipleResultsForUser(docs)
    }
  },
  Mutation: {
    createExercise: async (parent, args, context) => {
      debug('Running createExercise mutation with params:', args)

      // Args
      const { name, courseId, unitId } = args

      // Collection
      const collection = context.db.collection('exercises')

      // Look up for duplicates
      const docWithSameName = await collection.findOne({ name: name })
      const isDuplicated = docWithSameName &&
        docWithSameName.disabled !== true &&
        docWithSameName.courseId.toString() === courseId &&
        docWithSameName.unitId.toString() === unitId &&
        docWithSameName.disabled !== true
      if (isDuplicated) {
        throw new ApolloError(BACKEND_ERRORS.DUPLICATED_ENTITY)
      }

      // Query
      const newItem = {
        _id: new ObjectId(),
        name: name,
        courseId: new ObjectId(courseId),
        unitId: new ObjectId(unitId),
        created: new Date().toISOString()
      }

      // Exec
      const response = await collection.insertOne(newItem, { writeConcern: { w: 'majority' } })

      // Results
      if (response.result.ok !== 1) {
        debug('createExercise error:', response.error.message)
        throw new Error(response.error.message)
      }
      return prepSingleResultForUser(response.ops[0])
    },
    updateExercise: async (parent, args, context) => {
      debug('Running updateExercise mutation with params:', args)

      // Args
      const { id, name, courseId, unitId } = args

      // Collection
      const collection = context.db.collection('exercises')

      // Look up for duplicates
      const docWithSameName = await collection.findOne({ name: name })
      const isDuplicated = docWithSameName &&
        docWithSameName.courseId.toString() === courseId &&
        docWithSameName.unitId.toString() === unitId &&
        docWithSameName.disabled !== true
      if (isDuplicated) {
        throw new ApolloError(BACKEND_ERRORS.DUPLICATED_ENTITY)
      }

      // Query
      const update = {
        $set: {
          name,
          courseId: new ObjectId(courseId),
          unitId: new ObjectId(unitId),
          updated: new Date().toISOString()
        }
      }

      // Exec
      const response = await collection.findOneAndUpdate({ _id: new ObjectId(id) }, update, { returnDocument: 'after', w: 'majority' })

      // Results
      if (response.ok !== 1) {
        debug('updateExercise error:', response.lastErrorObject)
        throw new Error(response.lastErrorObject)
      }
      return prepSingleResultForUser(response.value)
    },
    disableExercise: async (parent, args, context) => {
      debug('Running disableExercise mutation with params:', args)

      // Args
      const { id } = args
      const objExerciseId = new ObjectId(id)

      // Collection
      const collection = context.db.collection('exercises')
      const exercisesCollection = context.db.collection('exam-templates')

      // Validate related entities
      const findRelatedEntities = [{
        $match: {
          disabled: { $ne: true },
          'exercises._id': objExerciseId
        }
      }]
      const templatesRelated = await exercisesCollection.aggregate(findRelatedEntities).toArray()
      debug('templatesRelated: ', templatesRelated)
      if (templatesRelated.length !== 0) {
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
      const response = await collection.findOneAndUpdate({ _id: objExerciseId }, update, { returnDocument: 'after', w: 'majority' })

      // Results
      if (response.ok !== 1) {
        debug('disableExercise error:', response.lastErrorObject)
        throw new Error(response.lastErrorObject)
      }
      return prepSingleResultForUser(response.value)
    },
    deleteExercise: async (parent, args, context) => {
      debug('Running deleteExercise mutation with params:', args)

      // Args
      const { id } = args

      // Collection
      const collection = context.db.collection('exercises')

      // Query
      const query = { _id: new ObjectId(id) }

      // Exec
      const { result } = await collection.deleteOne(query, { w: 'majority' })

      // Results
      if (result && result.n === 1 && result.ok === 1) {
        return { done: true }
      } else {
        debug('deleteExercise error:', BACKEND_ERRORS.DELETE_FAILED)
        throw new Error(BACKEND_ERRORS.DELETE_FAILED)
      }
    }
  }
}

module.exports = {
  resolver
}
