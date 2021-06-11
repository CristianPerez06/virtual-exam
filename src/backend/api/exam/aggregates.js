const { ObjectId } = require('bson')

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
      points: '$exercise.points',
      answers: 1
    }
  }
]

const getExamsByIdNumberAndCourseId = (idNumber, courseId) => {
  let aggregate = [
    {
      $match: {
        completed: true
      }
    }
  ]
  const objCourseId = courseId ? new ObjectId(courseId) : null

  const byIdNumber = [
    {
      $match: {
        idNumber: idNumber
      }
    }
  ]
  const byCourseId = [
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
        examTemplateName: 1,
        idNumber: 1,
        created: 1,
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
        examTemplateName: 1,
        idNumber: 1,
        created: 1,
        courseId: '$templateInfo.courseId'
      }
    },
    {
      $match: {
        courseId: objCourseId
      }
    }
  ]

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
  getExamsByIdNumberAndCourseId
}
