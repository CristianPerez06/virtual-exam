const getExercisesAndAnswers = [
  {
    $project: {
      'exercises': 1
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

module.exports = {
  getExercisesAndAnswers
}
