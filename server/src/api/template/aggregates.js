const getExercises = [
  {
    $project: {
      _id: 0,
      exerciseIdsList: '$exercises'
    }
  },
  {
    $unwind: {
      path: '$exerciseIdsList',
      preserveNullAndEmptyArrays: false
    }
  },
  {
    $group: {
      _id: '$exerciseIdsList'
    }
  },
  {
    $lookup: {
      from: 'exercises',
      localField: '_id',
      foreignField: '_id',
      as: 'exercise'
    }
  },
  {
    $project: {
      _id: 0,
      exercise: {
        $arrayElemAt: ['$exercise', 0]
      }
    }
  }
]

module.exports = {
  getExercises
}
