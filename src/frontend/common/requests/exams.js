import gql from 'graphql-tag'

// requests
export const GET_EXAM = gql`
  query getExam($id: ID!) {
    getExam(id: $id) {
      id
      name
      created
      updated
      completed
      exercises {
        id
        name
        points
        answers {
          id
          name
          description
          correct
          selected
        }
      }
      score
    }
  }
`
export const LIST_EXAMS = gql`
  query listExams($idNumber: ID, $courseId: ID, $completed: Boolean) {
    listExams(idNumber: $idNumber, courseId: $courseId, completed: $completed) {
      data {
        id
        name
        created
        updated
        completed
        idNumber
        courseName
        score
      }
      count
    }
  }
`
export const CREATE_EXAM = gql`
  mutation createExam($assignedExamId: ID!, $examTemplateId: ID!, $idNumber: String!) {
    createExam(assignedExamId: $assignedExamId, examTemplateId: $examTemplateId, idNumber: $idNumber){
      id
      name
      created
      updated
      completed
      idNumber
      courseName
    }
  }
`
export const FINISH_EXAM = gql`
  mutation finishExam($id: ID!, $answerPerExerciseList: [AnswerPerExercise]!) {
    finishExam(id: $id, answerPerExerciseList: $answerPerExerciseList){
      id
      name
      created
      updated
      completed
      idNumber
      courseName
    }
  }
`
