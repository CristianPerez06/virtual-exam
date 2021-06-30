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
