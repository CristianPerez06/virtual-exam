import gql from 'graphql-tag'

// requests
export const GET_EXERCISE = gql`
  query getExercise ($id: ID!) {
    getExercise(id: $id) {
      id
      name
      courseId
      unitId,
      descriptionUrl
    }
  }
`
export const LIST_EXERCISES = gql`
  query listExercises($courseId: ID, $unitId: ID) {
    listExercises(courseId: $courseId, unitId: $unitId) {
      data {
        id
        name
        courseId
        unitId
      }
      count
    }
  }
`
export const LIST_VALID_EXERCISES = gql`
  query listValidExercises($courseId: ID!) {
    listValidExercises(courseId: $courseId) {
      data {
        id
        name
        courseId
        unitId
      }
      count
    }
  }
`
export const CREATE_EXERCISE = gql`
  mutation createExercise($name: String!, $courseId: ID!, $unitId: ID!) {
    createExercise(name: $name, courseId: $courseId, unitId: $unitId){
      id
      name
      courseId
      unitId
    }
  }
`
export const UPDATE_EXERCISE = gql`
  mutation updateExercise($id: ID!, $name: String!, $courseId: ID!, $unitId: ID!) {
    updateExercise(id: $id, name: $name, courseId: $courseId, unitId: $unitId){
      id
      name
      courseId
      unitId
    }
  }
`
export const UPDATE_EXERCISE_DESCRIPTION = gql`
  mutation updateExerciseDescription($id: ID!, $descriptionUrl: String!) {
    updateExerciseDescription(id: $id, descriptionUrl: $descriptionUrl){
      id
      name
      courseId
      unitId,
      descriptionUrl
    }
  }
`
export const DISABLE_EXERCISE = gql`
  mutation disableExercise($id: ID!) {
    disableExercise(id: $id){
      id
      name,
      courseId
      unitId
    }
  }
`
export const DELETE_EXERCISE = gql`
  mutation deleteExercise($id: ID!) {
    deleteExercise(id: $id){
      done
    }
  }
`
