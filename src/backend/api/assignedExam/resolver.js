const { ApolloError } = require('apollo-server-express')
const { ObjectId } = require('bson')
const { BACKEND_ERRORS } = require('../../utilities/constants')
const { prepSingleResultForUser, prepMultipleResultsForUser } = require('../../utilities/prepResults')
const { maintainIndex } = require('../../indexer')

const debug = require('debug')('virtual-exam:assigned-exams-resolver')

const init = () => {
  maintainIndex({
    shared: true,
    collectionName: 'assigned-exams',
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
    listAssignedExams: async (parent, args, context) => {
      debug('Running listAssignedExams query with params:', args)

      // Params
      const { idNumber } = args

      // Collection
      const collection = context.db.collection('assigned-exams')

      // Aggregate
      let aggregate = []

      if (idNumber) {
        aggregate = [
          ...aggregate,
          {
            $match: {
              idNumber: idNumber
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
    createAssignedExam: async (parent, args, context) => {
      debug('Running createAssignedExam mutation with params:', args)

      // Args
      const { examTemplateId, idNumber } = args
      const objExamTemplateId = new ObjectId(examTemplateId)

      // Collection
      const collection = context.db.collection('assigned-exams')
      const examTemplatesCollection = context.db.collection('exam-templates')

      // Look up for duplicates
      const dup = await collection.findOne({ examTemplateId: objExamTemplateId, idNumber: idNumber })
      if (dup) {
        throw new ApolloError(BACKEND_ERRORS.DUPLICATED_ENTITY.message, BACKEND_ERRORS.DUPLICATED_ENTITY.Code)
      }

      // Query
      const examTemplate = await examTemplatesCollection.findOne({ _id: objExamTemplateId })

      const newItem = {
        _id: new ObjectId(),
        examTemplateId: objExamTemplateId,
        examTemplateName: examTemplate.name,
        idNumber,
        created: new Date().toISOString()
      }

      // Exec
      const response = await collection.insertOne(newItem, { writeConcern: { w: 'majority' } })

      // Results
      if (response.result.ok !== 1) {
        debug('createAssignedExam error:', response.error.message)
        throw new Error(response.error.message)
      }
      return prepSingleResultForUser(response.ops[0])
    },
    deleteAssignedExam: async (parent, args, context) => {
      debug('Running deleteAssignedExam mutation with params:', args)

      // Args
      const { id } = args

      // Collection
      const collection = context.db.collection('assigned-exams')

      // Query
      const query = { _id: new ObjectId(id) }

      // Exec
      const { result } = await collection.deleteOne(query, { w: 'majority' })

      // Results
      if (result && result.n === 1 && result.ok === 1) {
        return { done: true }
      } else {
        debug('deleteAssignedExam error:', BACKEND_ERRORS.DELETE_FAILED.Code)
        throw new Error(BACKEND_ERRORS.DELETE_FAILED.Code)
      }
    }
  }
}

module.exports = {
  resolver
}
