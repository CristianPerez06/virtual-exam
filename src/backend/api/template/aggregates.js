const { ObjectId } = require('bson')
const { EXERCISES_VALIDATION_PARAMETERS } = require('../../utilities/constants')

const getExamTemplates = (name, courseId, useExerciseValidations = false) => {
  let aggregate = [
    {
      $match: {
        disabled: { $not: { $eq: true } }
      }
    }
  ]
  
  const byName = [
    {
      $match: {
        name: name
      }
    }
  ]

  const byCourseId = [
    {
      $match: {
        courseId: new ObjectId(courseId)
      }
    }
  ]

  const byExerciseValidations = [
    {
      $match: {
        disabled: { $ne: true }
      }
    },
    {
      $unwind: {
        path: '$exercises', 
        preserveNullAndEmptyArrays: false
      }
    },
    {
      $lookup: {
        from: 'answers', 
        localField: 'exercises._id', 
        foreignField: 'exerciseId', 
        as: 'answers'
      }
    },
    {
      $project: {
        _id: 1, 
        name: 1, 
        courseId: 1, 
        created: 1, 
        updated: 1, 
        exercise: {
          _id: '$exercises._id', 
          points: '$exercises.points', 
          hasCorrectAnswer: {
            $anyElementTrue: '$answers.correct'
          }
        }
      }
    },
    {
      $group: {
        _id: '$_id', 
        name: {
          '$first': '$name'
        },
        courseId: {
          $first: '$courseId'
        },
        created: {
          $first: '$created'
        },
        updated: {
          $first: '$updated'
        },
        exercises: {
          $push: '$exercise'
        }
      }
    },
    {
      $addFields: {
        exercisesTotalScore: {
          $sum: '$exercises.points'
        }
      }
    },
    {
      $project: {
        _id: 1, 
        name: 1, 
        courseId: 1, 
        created: 1, 
        updated: 1, 
        exercises: 1, 
        answersCorrectSet: {
          $allElementsTrue: '$exercises.hasCorrectAnswer'
        }, 
        exercisesAmountSet: {
          $gte: [
            { $size: '$exercises' },
            2
          ]
        }, 
        exercisesValidScoreSet: {
          $and: [
            {
              $ne: [
                { $sum: '$exercises.points' },
                EXERCISES_VALIDATION_PARAMETERS.NOTE_ZERO
              ]
            },
            {
              $gte: [
                { $sum: '$exercises.points' },
                EXERCISES_VALIDATION_PARAMETERS.NOTE_ALMOST_TEN
              ]
            },
            {
              $lte: [
                { $sum: '$exercises.points' },
                EXERCISES_VALIDATION_PARAMETERS.NOTE_TEN
              ]
            }
          ]
        }
      }
    },
    {
      $match: {
        answersCorrectSet: true, 
        exercisesAmountSet: true, 
        exercisesValidScoreSet: true
      }
    }
  ]

  if (name) {
    aggregate = [
      ...aggregate,
      ...byName
    ]
  }

  if (courseId) {
    aggregate = [
      ...aggregate,
      ...byCourseId
    ]
  }

  if (useExerciseValidations) {
    aggregate = [
      ...aggregate,
      ...byExerciseValidations
    ]
  }

  return aggregate
}

const getExercises = [
  {
    $project: {
      _id: 0, 
      exercisesWithPoints: '$exercises'
    }
  },
  {
    $unwind: {
      path: '$exercisesWithPoints', 
      preserveNullAndEmptyArrays: false
    }
  },
  {
    $lookup: {
      from: 'exercises', 
      localField: 'exercisesWithPoints._id', 
      foreignField: '_id', 
      as: 'exercise'
    }
  },
  {
    $project: {
      _id: 0, 
      exercise: {
        $arrayElemAt: [
          '$exercise', 0
        ]
      }, 
      points: '$exercisesWithPoints.points'
    }
  },
  {
    $addFields: {
      'exercise.points': '$points'
    }
  },
  {
    $project: {
      'exercise': 1
    }
  },
  {
    $lookup: {
      from: 'units', 
      localField: 'exercise.unitId', 
      foreignField: '_id', 
      as: 'unit'
    }
  },
  {
    $project: {
      exercise: 1, 
      unit: {
        $arrayElemAt: [
          '$unit', 0
        ]
      }
    }
  },
  {
    $addFields: {
      'exercise.unitName': '$unit.name'
    }
  },
  {
    $project: {
      'exercise': 1
    }
  }
]

module.exports = {
  getExamTemplates,
  getExercises
}
