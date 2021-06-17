import gql from 'graphql-tag'

// requests
export const LIST_ASSIGNED_EXAMS = gql`
  query listAssignedExams($idNumber: ID, $courseId: ID) {
    listAssignedExams(idNumber: $idNumber, courseId: $courseId) {
      data {
        id,
        examTemplateId
        examTemplateName
        created
        idNumber
        courseName
      }
      count
    }
  }
`
export const CREATE_ASSIGNED_EXAM = gql`
  mutation createAssignedExam($examTemplateId: ID!, $idNumber: ID!) {
    createAssignedExam(examTemplateId: $examTemplateId, idNumber: $idNumber){
      id,
      examTemplateId
      examTemplateName
      created
      idNumber
      courseName
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
