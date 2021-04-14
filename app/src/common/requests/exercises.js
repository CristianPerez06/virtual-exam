import gql from 'graphql-tag'

// requests
export const GET_EXERCISE = gql`
  query getExercise ($id: ID!) {
    getExercise(id: $id) {
      id
      name,
      courseId,
      unitId
    }
  }
`
export const LIST_EXERCISES = gql`
  query listExercises($courseId: ID, $unitId: ID) {
    listExercises(courseId: $courseId, unitId: $unitId) {
      data {
        id
        name,
        courseId,
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
      name,
      courseId,
      unitId
    }
  }
`
export const UPDATE_EXERCISE = gql`
  mutation updateExercise($id: ID!, $name: String!, $courseId: ID!, $unitId: ID!) {
    updateUnit(id: $id, name: $name, courseId: $courseId, unitId: $unitId){
      id
      name,
      courseId,
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
