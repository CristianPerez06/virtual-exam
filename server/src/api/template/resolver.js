const { ApolloError } = require('apollo-server-express')
const { ObjectId } = require('bson')
const { BACKEND_ERRORS } = require('../../utilities/constants')
const { addItemToList, removeItemFromList } = require('../../utilities/arrayHelpers')
const { prepSingleResultForUser, prepMultipleResultsForUser } = require('../../utilities/prepResults')
const { maintainIndex } = require('../../indexer')

const debug = require('debug')('virtual-exam:exam-templates-resolver')

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
    getExamTemplate: async (parent, args, context) => {
      debug('Running getExamTemplate query with params:', args)

      // Params
      const { id } = args

      // Collection
      const collection = context.db.collection('exam-templates')

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
    listExamTemplates: async (parent, args, context) => {
      debug('Running listExamTemplates query with params:', args)

      // Params
      const { name, courseId } = args

      // Collection
      const collection = context.db.collection('exam-templates')

      // Aggregate
      let aggregate = [{
        $match: {
          disabled: { $not: { $eq: true } }
        }
      }]

      if (name) {
        aggregate = [
          ...aggregate,
          {
            $match: {
              name: name
            }
          }
        ]
      }
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
    },
    listExamTemplateExercises: async (parent, args, context) => {
      debug('Running listExamTemplateExercises query with params:', args)

      // Params
      const { id } = args

      // Collection
      const collection = context.db.collection('exam-templates')

      // Aggregate
      const aggregate = [
        {
          $match: {
            _id: new ObjectId(id)
          }
        },
        {
          $project: {
            _id: 0,
            exerciseIdsList: '$exercises'
          }
        },
        {
          $unwind: {
            path: '$exerciseIdsList',
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $group: {
            _id: '$exerciseIdsList'
          }
        },
        {
          $lookup: {
            from: 'exercises',
            localField: '_id',
            foreignField: '_id',
            as: 'exercise'
          }
        },
        {
          $project: {
            _id: 0,
            exercise: {
              $arrayElemAt: ['$exercise', 0]
            }
          }
        }
      ]

      // Exec
      const res = await collection.aggregate(aggregate).toArray()

      // Results
      const data = res.map(x => prepSingleResultForUser(x.exercise))

      return { id: id, data: data, count: data.length }
    }
  },
  Mutation: {
    createExamTemplate: async (parent, args, context) => {
      debug('Running createExamTemplate mutation with params:', args)

      // Args
      const { name, courseId } = args

      // Collection
      const collection = context.db.collection('exam-templates')

      // Look up for duplicates
      const docWithSameName = await collection.findOne({ name: name })
      const isDuplicated = docWithSameName &&
        (docWithSameName.courseId || '').toString() === courseId &&
        docWithSameName.disabled !== true
      if (isDuplicated) {
        throw new ApolloError(BACKEND_ERRORS.DUPLICATED_ENTITY.Message, BACKEND_ERRORS.DUPLICATED_ENTITY.Code)
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
        debug('createExamTemplate error:', response.error.message)
        throw new Error(response.error.message)
      }
      return prepSingleResultForUser(response.ops[0])
    },
    updateExamTemplate: async (parent, args, context) => {
      debug('Running updateExamTemplate mutation with params:', args)

      // Args
      const { id, name, courseId } = args

      // Collection
      const collection = context.db.collection('exam-templates')

      // Look up for duplicates
      const docWithSameName = await collection.findOne({ name: name })
      const isDuplicated = docWithSameName &&
        (docWithSameName.courseId || '').toString() === courseId &&
        docWithSameName.disabled !== true
      if (isDuplicated) {
        throw new ApolloError(BACKEND_ERRORS.DUPLICATED_ENTITY.Message, BACKEND_ERRORS.DUPLICATED_ENTITY.Code)
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
        debug('updateExamTemplate error:', response.lastErrorObject)
        throw new Error(response.lastErrorObject)
      }
      return prepSingleResultForUser(response.value)
    },
    disableExamTemplate: async (parent, args, context) => {
      debug('Running disableExamTemplate mutation with params:', args)

      // Args
      const { id } = args

      // Collection
      const collection = context.db.collection('exam-templates')

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
        debug('disableExamTemplate error:', response.lastErrorObject)
        throw new Error(response.lastErrorObject)
      }
      return prepSingleResultForUser(response.value)
    },
    deleteExamTemplate: async (parent, args, context) => {
      debug('Running deleteExamTemplate mutation with params:', args)

      // Args
      const { id } = args

      // Collection
      const collection = context.db.collection('exam-templates')

      // Query
      const query = { _id: new ObjectId(id) }

      // Exec
      const { result } = await collection.deleteOne(query, { w: 'majority' })

      // Results
      if (result && result.n === 1 && result.ok === 1) {
        return { done: true }
      } else {
        debug('deleteExamTemplate error:', BACKEND_ERRORS.DELETE_FAILED.Code)
        throw new Error(BACKEND_ERRORS.DELETE_FAILED.Code)
      }
    },
    resetExamTemplate: async (parent, args, context) => {
      debug('Running resetExamTemplate mutation with params:', args)

      // Args
      const { id } = args
      const objTempId = new ObjectId(id)

      // Collection
      const collection = context.db.collection('exam-templates')

      // Query
      const update = {
        $set: {
          courseId: null,
          exercises: [],
          updated: new Date().toISOString()
        }
      }

      // Exec
      const response = await collection.findOneAndUpdate({ _id: objTempId }, update, { returnOriginal: false, w: 'majority' })

      // Results
      if (response.ok !== 1) {
        debug('resetExamTemplate error:', response.lastErrorObject)
        throw new Error(response.lastErrorObject)
      }

      return { done: true }
    },
    addExerciseToExamTemplate: async (parent, args, context) => {
      debug('Running addExerciseToExamTemplate mutation with params:', args)

      // Args
      const { templateId, exerciseId } = args
      const objTempId = new ObjectId(templateId)
      const objExercId = new ObjectId(exerciseId)

      // Collection
      const collection = context.db.collection('exam-templates')
      const examTemplate = await collection.findOne({ _id: objTempId })
      const examTemplateExercises = examTemplate.exercises || []

      const exercisesCollection = context.db.collection('exercises')
      const currentExercise = await exercisesCollection.findOne({ _id: objExercId })

      // Look up for duplicates
      const dupExercise = examTemplateExercises.find(x => x.toString() === objExercId.toString())
      if (dupExercise) {
        throw new ApolloError(BACKEND_ERRORS.DUPLICATED_ENTITY.Message, BACKEND_ERRORS.DUPLICATED_ENTITY.Code)
      }

      const newExercises = addItemToList(examTemplateExercises, objExercId)

      // Query
      const update = {
        $set: {
          exercises: newExercises,
          updated: new Date().toISOString()
        }
      }

      // Exec
      const response = await collection.findOneAndUpdate({ _id: objTempId }, update, { returnOriginal: false, w: 'majority' })

      // Results
      if (response.ok !== 1) {
        debug('addExerciseToExamTemplate error:', response.lastErrorObject)
        throw new Error(response.lastErrorObject)
      }

      return prepSingleResultForUser(currentExercise)
    },
    removeExerciseFromExamTemplate: async (parent, args, context) => {
      debug('Running removeExerciseFromExamTemplate mutation with params:', args)

      // Args
      const { templateId, exerciseId } = args
      const objTempId = new ObjectId(templateId)
      const objExercId = new ObjectId(exerciseId)

      // Collection
      const collection = context.db.collection('exam-templates')
      const examTemplate = await collection.findOne({ _id: objTempId })

      const exercisesCollection = context.db.collection('exercises')
      const currentExercise = await exercisesCollection.findOne({ _id: objExercId })

      // Query
      const examTemplateExercises = examTemplate.exercises || []
      const updatedExercisesList = removeItemFromList(examTemplateExercises, objExercId)
      const update = {
        $set: {
          exercises: updatedExercisesList,
          updated: new Date().toISOString()
        }
      }

      // Exec
      const response = await collection.findOneAndUpdate({ _id: objTempId }, update, { returnOriginal: false, w: 'majority' })

      // Results
      if (response.ok !== 1) {
        debug('removeExerciseFromExamTemplate error:', response.lastErrorObject)
        throw new Error(response.lastErrorObject)
      }

      return prepSingleResultForUser(currentExercise)
    }
  }
}

module.exports = {
  resolver
}
