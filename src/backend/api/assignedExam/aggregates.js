const { ObjectId } = require('bson')

const getAssignedExamsByIdNumberAndCourseId = (idNumber, courseId) => {
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
        examTemplateId: 1, 
        examTemplateName: 1, 
        idNumber: 1, 
        created: 1, 
        course: {
          '$arrayElemAt': [
            '$course', 0
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
        courseId: {
          $convert: {
            input: '$course._id', to: "string"
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
