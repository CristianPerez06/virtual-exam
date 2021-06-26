const { ApolloError } = require('apollo-server-express')
const { ObjectId } = require('bson')
const { BACKEND_ERRORS } = require('../../utilities/constants')
const { prepSingleResultForUser, prepMultipleResultsForUser } = require('../../utilities/prepResults')
const { maintainIndex } = require('../../indexer')

const debug = require('debug')('virtual-exam:answers-resolver')

const init = () => {
  maintainIndex({
    shared: true,
    collectionName: 'answers',
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
    getAnswer: async (parent, args, context) => {
      debug('Running getAnswer query with params:', args)

      // Params
      const { id } = args

      // Collection
      const collection = context.db.collection('answers')

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
    listAnswers: async (parent, args, context) => {
      debug('Running listAnswers query with params:', args)

      // Params
      const { exerciseId } = args

      // Collection
      const collection = context.db.collection('answers')

      if (!exerciseId) {
        throw new ApolloError(BACKEND_ERRORS.PARAMETER_NOT_PROVIDED)
      }

      // Aggregate
      const aggregate = [{
        $match: {
          exerciseId: new ObjectId(exerciseId),
          disabled: { $not: { $eq: true } }
        }
      }]
      debug('Aggregate: ', aggregate)

      // Exec
      const docs = await collection.aggregate(aggregate).toArray()

      // Results
      return prepMultipleResultsForUser(docs)
    }
  },
  Mutation: {
    createAnswer: async (parent, args, context) => {
      debug('Running createAnswer mutation with params:', args)

      // Args
      const { name, description, correct, exerciseId } = args

      // Collection
      const collection = context.db.collection('answers')

      // Look up for duplicates
      const docWithSameName = await collection.findOne({ name: name })
      const isDuplicated = docWithSameName &&
        docWithSameName.exerciseId.toString() === exerciseId &&
        docWithSameName.disabled !== true
      if (isDuplicated) {
        throw new ApolloError(BACKEND_ERRORS.DUPLICATED_ENTITY)
      }

      // Lookup for duplicate Correct answers
      const answers = await collection.find({ exerciseId: new ObjectId(exerciseId) }).toArray()
      const correctAnwer = answers
        .filter(answer => !answer.disabled)
        .find(el => el.correct === true)
      const correctAlreadyExists = correctAnwer && correct === true
      if (correctAlreadyExists) {
        throw new ApolloError(BACKEND_ERRORS.CORRECT_ANSWER_ALREADY_SELECTED)
      }

      // Query
      const newItem = {
        _id: new ObjectId(),
        name: name,
        description: description,
        correct: correct,
        exerciseId: new ObjectId(exerciseId),
        created: new Date().toISOString()
      }

      // Exec
      const response = await collection.insertOne(newItem, { writeConcern: { w: 'majority' } })

      // Results
      if (response.result.ok !== 1) {
        debug('createAnswer error:', response.error.message)
        throw new Error(response.error.message)
      }
      return prepSingleResultForUser(response.ops[0])
    },
    updateAnswer: async (parent, args, context) => {
      debug('Running updateAnswer mutation with params:', args)

      // Args
      const { id, name, description, correct, exerciseId } = args

      // Collection
      const collection = context.db.collection('answers')

      // Look up for duplicates
      const docWithSameName = await collection.findOne({ name: name })
      const isDuplicated = docWithSameName &&
        docWithSameName.exerciseId.toString() === exerciseId &&
        docWithSameName._id.toString() !== id &&
        docWithSameName.disabled !== true
      if (isDuplicated) {
        throw new ApolloError(BACKEND_ERRORS.DUPLICATED_ENTITY)
      }

      // Lookup for duplicate Correct answers
      const answers = await collection.find({ exerciseId: new ObjectId(exerciseId) }).toArray()
      const correctAnwer = answers
        .filter(answer => !answer.disabled)
        .find(el => el.correct === true)
      const correctAlreadyExists = correctAnwer &&
        correctAnwer._id.toString() !== id &&
        correct === true
      if (correctAlreadyExists) {
        throw new ApolloError(BACKEND_ERRORS.CORRECT_ANSWER_ALREADY_SELECTED)
      }

      // Query
      const update = {
        $set: {
          name,
          description,
          correct,
          exerciseId: new ObjectId(exerciseId),
          updated: new Date().toISOString()
        }
      }

      // Exec
      const response = await collection.findOneAndUpdate({ _id: new ObjectId(id) }, update, { returnDocument: 'after', w: 'majority' })

      // Results
      if (response.ok !== 1) {
        debug('updateAnswer error:', response.lastErrorObject)
        throw new Error(response.lastErrorObject)
      }
      return prepSingleResultForUser(response.value)
    },
    updateAnswerDescriptionUrl: async (parent, args, context) => {
      debug('Running updateAnswerDescriptionUrl mutation with params:', args)

      // Args
      const { id, descriptionUrl } = args
      const objAnswerId = new ObjectId(id)

      // Collection
      const collection = context.db.collection('answers')

      // Query
      const update = {
        $set: {
          descriptionUrl: descriptionUrl,
          updated: new Date().toISOString()
        }
      }

      // Exec
      const response = await collection.findOneAndUpdate({ _id: objAnswerId }, update, { returnDocument: 'after', w: 'majority' })

      // Results
      if (response.ok !== 1) {
        debug('updateAnswerDescriptionUrl error:', response.lastErrorObject)
        throw new Error(response.lastErrorObject)
      }
      return prepSingleResultForUser(response.value)
    },
    disableAnswer: async (parent, args, context) => {
      debug('Running disableAnswer mutation with params:', args)

      // Args
      const { id } = args

      // Collection
      const collection = context.db.collection('answers')

      // Query
      const update = {
        $set: {
          disabled: true,
          updated: new Date().toISOString()
        }
      }

      // Exec
      const response = await collection.findOneAndUpdate({ _id: new ObjectId(id) }, update, { returnDocument: 'after', w: 'majority' })

      // Results
      if (response.ok !== 1) {
        debug('disableAnswer error:', response.lastErrorObject)
        throw new Error(response.lastErrorObject)
      }
      return prepSingleResultForUser(response.value)
    },
    deleteAnswer: async (parent, args, context) => {
      debug('Running deleteAnswer mutation with params:', args)

      // Args
      const { id } = args

      // Collection
      const collection = context.db.collection('answers')

      // Query
      const query = { _id: new ObjectId(id) }

      // Exec
      const { result } = await collection.deleteOne(query, { w: 'majority' })

      // Results
      if (result && result.n === 1 && result.ok === 1) {
        return { done: true }
      } else {
        debug('deleteAnswer error:', BACKEND_ERRORS.DELETE_FAILED)
        throw new Error(BACKEND_ERRORS.DELETE_FAILED)
      }
    }
  }
}

module.exports = {
  resolver
}
