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
      exercise: 1
    }
  }
]

module.exports = {
  getExercises
}
