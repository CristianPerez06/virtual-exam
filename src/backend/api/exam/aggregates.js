const getExercisesAndAnswers = [
  {
    $project: {
      exercises: 1
    }
  },
  {
    $unwind: {
      path: '$exercises',
      preserveNullAndEmptyArrays: false
    }
  },
  {
    $project: {
      _id: 1,
      exerciseWithPoints: '$exercises'
    }
  },
  {
    $lookup: {
      from: 'exercises',
      localField: 'exerciseWithPoints._id',
      foreignField: '_id',
      as: 'exercise'
    }
  },
  {
    $lookup: {
      from: 'answers',
      localField: 'exercise._id',
      foreignField: 'exerciseId',
      as: 'answers'
    }
  },
  {
    $addFields: {
      'exercise.points': '$exerciseWithPoints.points'
    }
  },
  {
    $project: {
      _id: 0,
      exerciseId: 1,
      exercise: {
        $arrayElemAt: [
          '$exercise', 0
        ]
      },
      answers: {
        $filter: {
          input: '$answers',
          as: 'answer',
          cond: {
            $ne: [
              '$$answer.disabled', true
            ]
          }
        }
      }
    }
  },
  {
    $project: {
      _id: '$exercise._id',
      name: '$exercise.name',
      description: '$exercise.description',
      descriptionUrl: '$exercise.descriptionUrl',
      points: '$exercise.points',
      answers: 1
    }
  }
]

const getExamsByCustomParameters = (idNumber, courseId, completed) => {
  let aggregate = []

  const commonQuery = [
    {
      $lookup: {
        from: 'exam-templates',
        localField: 'examTemplateId',
        foreignField: '_id',
        as: 'examTemplate'
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        examTemplateId: 1,
        idNumber: 1,
        created: 1,
        updated: 1,
        completed: 1,
        score: 1,
        templateInfo: {
          $arrayElemAt: [
            '$examTemplate', 0
          ]
        }
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        examTemplateId: 1,
        idNumber: 1,
        created: 1,
        updated: 1,
        completed: 1,
        score: 1,
        courseId: '$templateInfo.courseId'
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'courseId',
        foreignField: '_id',
        as: 'course'
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        examTemplateId: 1,
        idNumber: 1,
        created: 1,
        updated: 1,
        completed: 1,
        score: 1,
        course: {
          $arrayElemAt: ['$course', 0]
        }
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        examTemplateId: 1,
        idNumber: 1,
        created: 1,
        updated: 1,
        completed: 1,
        score: 1,
        courseId: {
          $convert: {
            input: '$course._id', to: 'string'
          }
        },
        courseName: '$course.name'
      }
    }
  ]

  aggregate = [
    ...aggregate,
    ...commonQuery
  ]

  const byStatusCompleted = [
    {
      $match: {
        completed: true
      }
    }
  ]
  const byIdNumber = [
    {
      $match: {
        idNumber: idNumber
      }
    }
  ]
  const byCourseId = [
    {
      $match: {
        courseId: courseId
      }
    }
  ]

  if (completed) {
    aggregate = [
      ...aggregate,
      ...byStatusCompleted
    ]
  }

  if (idNumber) {
    aggregate = [
      ...aggregate,
      ...byIdNumber
    ]
  }

  if (courseId) {
    aggregate = [
      ...aggregate,
      ...byCourseId
    ]
  }

  return aggregate
}

module.exports = {
  getExercisesAndAnswers,
  getExamsByCustomParameters
}
