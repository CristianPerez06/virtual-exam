import gql from 'graphql-tag'

// requests
export const LIST_EXAMS = gql`
  query listExams($idNumber: ID!) {
    listExams(idNumber: $idNumber) {
      data {
        id
        name
      }
      count
    }
  }
`
export const CREATE_EXAM = gql`
  mutation createExam($assignedExamId: ID!, $examTemplateId: ID!, $idNumber: String!) {
    createExam(assignedExamId: $assignedExamId, examTemplateId: $examTemplateId, idNumber: $idNumber){
      id,
      name
      examTemplateId,
    }
  }
`
