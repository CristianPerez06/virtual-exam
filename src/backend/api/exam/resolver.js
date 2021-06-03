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
    getExam: async (parent, args, context) => {
      debug('Running getExam query with params:', args)

      // Params
      const { id } = args
      const objId = new ObjectId(id)

      // Collection
      const collection = context.db.collection('exams')

      // Query
      const query = { _id: objId }

      // Exec
      const docs = await collection
        .find(query)
        .toArray()

      // Results
      const { exercises, ...rest } = docs[0]
      const exam = prepSingleResultForUser(rest)

      const mappedExercises = exercises.map((exercise) => {
        const { answers, ...rest } = exercise
        const mappedAnswers = answers.map((answer) => {
          return prepSingleResultForUser(answer)
        })
        const exerciseForUser = prepSingleResultForUser(rest)
        exerciseForUser.answers = mappedAnswers
        return exerciseForUser
      })
      exam.exercises = mappedExercises
      debug('exam', exam)
      return exam
    },
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
      const dup = await collection.findOne({ idNumber: idNumber, examTemplateId: objExamTemplateId, completed: false })
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
    },
    finishExam: async (parent, args, context) => {
      debug('Running finishExam mutation with params:', args)

      // Args
      const { id, answerPerExerciseList } = args
      const objExamId = new ObjectId(id)

      // Collection
      const collection = context.db.collection('exams')

      // Get exam
      const exam = await collection.findOne({ _id: objExamId })

      // Map selected answers
      const transformedExercises = exam.exercises.map(exercise => {
        // Exercise to update
        const transformedExercise = { ...exercise }

        // Get Updated values
        const answerPerExercise = answerPerExerciseList.find(x => x.exerciseId === exercise._id.toString())

        const transformedAnswers = transformedExercise.answers.map((answer) => {
          // When no answer was selected
          if (!answerPerExercise) {
            answer.selected = false
            return answer
          }

          // When an answer was selected
          answer.selected = answer._id.toString() === answerPerExercise.answerId
          return answer
        })

        // Update exercise with updated answers
        transformedExercise.answers = transformedAnswers

        return transformedExercise
      })

      // Query
      const update = {
        $set: {
          exercises: transformedExercises,
          completed: true,
          updated: new Date().toISOString()
        }
      }

      const response = await collection.findOneAndUpdate({ _id: objExamId }, update, { returnDocument: 'after', w: 'majority' })

      // Results
      if (response.ok !== 1) {
        debug('finishExam error:', response.lastErrorObject)
        throw new Error(response.lastErrorObject)
      }

      return prepSingleResultForUser(response.value)
    }
  }
}

module.exports = {
  resolver
}
