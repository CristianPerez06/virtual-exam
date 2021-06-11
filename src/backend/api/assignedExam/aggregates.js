const { ObjectId } = require('bson')

const getAssignedExamsByIdNumberAndCourseId = (idNumber, courseId) => {
  let aggregate = []
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
  getAssignedExamsByIdNumberAndCourseId
}
