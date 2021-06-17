import gql from 'graphql-tag'

// requests
export const GET_EXAM_TEMPLATE = gql`
  query getExamTemplate ($id: ID!) {
    getExamTemplate(id: $id) {
      id
      name
      courseId
    }
  }
`
export const LIST_EXAM_TEMPLATES = gql`
  query listExamTemplates($name: String, $courseId: ID) {
    listExamTemplates(name: $name, courseId: $courseId) {
      data {
        id
        name
        courseId
      }
      count
    }
  }
`
export const LIST_VALID_EXAM_TEMPLATES = gql`
  query listValidExamTemplates($name: String, $courseId: ID) {
    listValidExamTemplates(name: $name, courseId: $courseId) {
      data {
        id
        name
        courseId
      }
      count
    }
  }
`
export const CREATE_EXAM_TEMPLATE = gql`
  mutation createExamTemplate($name: String!, $courseId: ID!) {
    createExamTemplate(name: $name, courseId: $courseId){
      id
      name
      courseId
    }
  }
`
export const UPDATE_EXAM_TEMPLATE = gql`
  mutation updateExamTemplate($id: ID!, $name: String!, $courseId: ID!) {
    updateExamTemplate(id: $id, name: $name, courseId: $courseId){
      id
      name
      courseId
    }
  }
`
export const DISABLE_EXAM_TEMPLATE = gql`
  mutation disableExamTemplate($id: ID!) {
    disableExamTemplate(id: $id){
      id
      name
    }
  }
`
export const DELETE_EXAM_TEMPLATE = gql`
  mutation deleteExamTemplate($id: ID!) {
    deleteExamTemplate(id: $id){
      done
    }
  }
`
export const RESET_EXAM_TEMPLATE = gql`
  mutation resetExamTemplate($id: ID!) {
    resetExamTemplate(id: $id){
      done
    }
  }
`
export const LIST_EXAM_TEMPLATE_EXERCISES = gql`
  query listExamTemplateExercises($id: ID!) {
    listExamTemplateExercises(id: $id) {
      data {
        id
        name
        points
        unitName
      }
      count
    }
  }
`
export const ADD_EXERCISE_TO_EXAM_TEMPLATE = gql`
  mutation addExerciseToExamTemplate($templateId: ID!, $exerciseId: ID!) {
    addExerciseToExamTemplate(templateId: $templateId, exerciseId: $exerciseId){
      id,
      name,
      points,
      unitName
    }
  }
`
export const REMOVE_EXERCISE_FROM_EXAM_TEMPLATE = gql`
  mutation removeExerciseFromExamTemplate($templateId: ID!, $exerciseId: ID!) {
    removeExerciseFromExamTemplate(templateId: $templateId, exerciseId: $exerciseId){
      id,
      name
    }
  }
`
export const UPDATE_EXERCISE_NOTE = gql`
  mutation updateExerciseNote($id: ID!, $exerciseId: ID!, $exercisePoints: Float!) {
    updateExerciseNote(id: $id, exerciseId: $exerciseId, exercisePoints: $exercisePoints){
      id
      name
      points
    }
  }
`
