import gql from 'graphql-tag'

// requests
export const LIST_ASSIGNED_EXAMS = gql`
  query listAssignedExams($idNumber: ID!) {
    listAssignedExams(idNumber: $idNumber) {
      data {
        id,
        examTemplateId
        examTemplateName
      }
      count
    }
  }
`
export const CREATE_ASSIGNED_EXAM = gql`
  mutation createAssignedExam($examTemplateId: ID!, $idNumber: ID!) {
    createAssignedExam(examTemplateId: $examTemplateId, idNumber: $idNumber){
      id
      idNumber,
      examTemplateId,
      examTemplateName
    }
  }
`
export const DELETE_ASSIGNED_EXAM = gql`
  mutation deleteAssignedExam($id: ID!) {
    deleteAssignedExam(id: $id){
      done
    }
  }
`
