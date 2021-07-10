import gql from 'graphql-tag'

// requests
export const GET_EXAM_METRICS = gql`
  query getExamMetrics ($dateFrom: String!, $dateTo: String!) {
    getExamMetrics(dateFrom: $dateFrom, dateTo: $dateTo) {
      data {
        courseId
        courseName
        total
        totalPassed
        totalFailed
        }
      count
    }
  }
`
export const GET_EXAM_REPORTS_DATA = gql`
  query getExamsReportData ($dateFrom: String!, $dateTo: String!) {
    getExamsReportData(dateFrom: $dateFrom, dateTo: $dateTo) {
      data {
        id
        name
        created
        updated
        completed
        exercises {
          _id
          name
          points
          description
          descriptionUrl
          answers {
            _id
            name
            description
            descriptionUrl
            correct
            selected
          }
        }
        score
      }
      count
    }
  }
`