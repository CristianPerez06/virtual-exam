const { ApolloError } = require('apollo-server-express')
const { ObjectId } = require('bson')
const { BACKEND_ERRORS } = require('../../utilities/constants')
const { prepSingleResultForUser, prepMultipleResultsForUser } = require('../../utilities/prepResults')
const { maintainIndex } = require('../../indexer')
const { getExercisesAndAnswers } = require('./aggregates')

const debug = require('debug')('virtual-exam:exams-resolver')

const init = () => {
  maintainIndex({
    shared: true,
    collectionName: 'exams',
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
    listExams: async (parent, args, context) => {
      debug('Running listExams query with params:', args)

      // Params
      const { idNumber } = args

      // Collection
      const collection = context.db.collection('exams')

      // Exec
      const docs = await collection.find({ idNumber: idNumber }).toArray()

      // Results
      return prepMultipleResultsForUser(docs)
    }
  },
  Mutation: {
    // TO DO - Use transactions
    createExam: async (parent, args, context) => {
      debug('Running createExam mutation with params:', args)

      // Args
      const { assignedExamId, examTemplateId, idNumber } = args
      const objExamTemplateId = new ObjectId(examTemplateId)
      const objAssignedExamId = new ObjectId(assignedExamId)

      // Collection
      const collection = context.db.collection('exams')
      const templatesCollection = context.db.collection('exam-templates')
      const assignedExamsCollection = context.db.collection('assigned-exams')

      // Look up for duplicates
      const dup = await collection.findOne({ idNumber: idNumber, examTemplateId: objExamTemplateId })
      if (dup) {
        throw new ApolloError(BACKEND_ERRORS.DUPLICATED_ENTITY)
      }

      // Get exam template
      const examTemplate = await templatesCollection.findOne({ _id: objExamTemplateId })

      // Aggregate
      const aggregate = [
        { $match: { _id: objExamTemplateId, disabled: { $ne: true } } },
        ...getExercisesAndAnswers
      ]
      const exercisesAndAnswers = await templatesCollection.aggregate(aggregate).toArray()
      debug(exercisesAndAnswers)

      // Create new exam
      const newItem = {
        _id: new ObjectId(),
        name: examTemplate.name,
        idNumber,
        examTemplateId: objExamTemplateId,
        exercises: [...exercisesAndAnswers],
        created: new Date().toISOString()
      }
      const responseCreate = await collection.insertOne(newItem, { writeConcern: { w: 'majority' } })

      // Delete assigned exam
      await assignedExamsCollection.deleteOne({ _id: objAssignedExamId }, { w: 'majority' })

      // Results
      if (responseCreate.result.ok !== 1) {
        debug('createExam error:', responseCreate.error.message)
        throw new Error(responseCreate.error.message)
      }
      return prepSingleResultForUser(responseCreate.ops[0])
    }
  }
}

module.exports = {
  resolver
}
