const { EXERCISES_VALIDATION_PARAMETERS } = require('../../utilities/constants')

const getExamMetrics = (dateStrFrom, dateStrTo) => {
  return [
    {
      $project: {
        courseId: 1,
        courseName: 1,
        completed: 1,
        score: 1,
        updated: {
          $dateFromString: {
            dateString: '$updated'
          }
        }
      }
    },
    {
      $match: {
        completed: true,
        updated: {
          $gte: new Date(dateStrFrom),
          $lt: new Date(dateStrTo)
        }
      }
    },
    {
      $group: {
        _id: '$courseId',
        courseName: {
          $first: '$courseName'
        },
        total: {
          $sum: 1
        },
        totalPassed: {
          $sum: {
            $cond: [
              { $gte: ['$score', EXERCISES_VALIDATION_PARAMETERS.PASSING_SCORE] },
              1,
              0
            ]
          }
        },
        totalFailed: {
          $sum: {
            $cond: [
              { $lt: ['$score', EXERCISES_VALIDATION_PARAMETERS.PASSING_SCORE] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        courseId: '$_id',
        courseName: 1,
        total: 1,
        totalPassed: 1,
        totalFailed: 1
      }
    }
  ]
}

const getExamsReportData = (dateStrFrom, dateStrTo) => {
  return [
    {
      $project: {
        _id: 1,
        name: 1,
        idNumber: 1,
        examTemplateId: 1,
        courseId: 1,
        courseName: 1,
        exercises: 1,
        created: 1,
        completed: 1,
        score: 1,
        updated: {
          $dateFromString: {
            dateString: '$created'
          }
        }
      }
    },
    {
      $match: {
        completed: true,
        updated: {
          $gte: new Date(dateStrFrom),
          $lt: new Date(dateStrTo)
        }
      }
    }
  ]
}

module.exports = {
  getExamMetrics,
  getExamsReportData
}
