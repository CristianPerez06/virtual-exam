const { EXERCISES_VALIDATION_PARAMETERS } = require('../../utilities/constants')

const getValidExercises = (courseId) => {
  const validExercises = [
    {
      $match: {
        disabled: { $not: { $eq: true } },
        courseId: courseId
      }
    },
    {
      $lookup: {
        from: 'answers', 
        localField: '_id', 
        foreignField: 'exerciseId', 
        as: 'answers'
      }
    },
    {
      $addFields: {
        hasCorrectAnswer: {
          $anyElementTrue: '$answers.correct'
        }
      }
    },
    {
      $project: {
        _id: 1, 
        name: 1, 
        courseId: 1, 
        unitId: 1, 
        hasCorrectAnswer: 1, 
        answersCount: {
          $size: '$answers'
        }
      }
    },
    {
      $project: {
        _id: 1, 
        name: 1, 
        courseId: 1, 
        unitId: 1, 
        hasCorrectAnswer: 1, 
        hasCorrectAnswersCount: {
          $gte: ['$answersCount', EXERCISES_VALIDATION_PARAMETERS.MINIMUM_ANSWERS_AMOUNT]
        }
      }
    },
    {
      $match: {
        hasCorrectAnswer: true, 
        hasCorrectAnswersCount: true
      }
    }
  ]

  const aggregate = [
    ...validExercises
  ]

  return aggregate
}

module.exports = {
  getValidExercises
}