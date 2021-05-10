const getExercisesAndAnswers = [
  {
    $project: { exercises: 1 }
  },
  {
    $unwind: { path: '$exercises', preserveNullAndEmptyArrays: false }
  },
  {
    $project: { _id: 1, exerciseId: '$exercises' }
  },
  {
    $lookup: {
      from: 'exercises',
      localField: 'exerciseId',
      foreignField: '_id',
      as: 'exercise'
    }
  },
  {
    $lookup: {
      from: 'answers',
      localField: 'exerciseId',
      foreignField: 'exerciseId',
      as: 'answers'
    }
  },
  {
    $project: {
      _id: 0,
      exerciseId: 1,
      exercise: { $arrayElemAt: ['$exercise', 0] },
      answers: {
        $filter: {
          input: '$answers',
          as: 'answer',
          cond: { $ne: ['$$answer.disabled', true] }
        }
      }
    }
  },
  {
    $project: { _id: '$exercise._id', name: '$exercise.name', answers: 1 }
  }
]

module.exports = {
  getExercisesAndAnswers
}
