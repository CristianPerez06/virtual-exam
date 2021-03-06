import gql from 'graphql-tag'

// requests
export const GET_COURSE = gql`
  query getCourse ($id: ID!) {
    getCourse(id: $id) {
      id
      name
    }
  }
`
export const LIST_COURSES = gql`
  query listCourses($name: String) {
    listCourses(name: $name) {
      data {
        id
        name
      }
      count
    }
  }
`
export const CREATE_COURSE = gql`
  mutation createCourse($name: String!) {
    createCourse(name: $name){
      id
      name
    }
  }
`
export const UPDATE_COURSE = gql`
  mutation updateCourse($id: ID!, $name: String!) {
    updateCourse(id: $id, name: $name){
      id
      name
    }
  }
`
export const DISABLE_COURSE = gql`
  mutation disableCourse($id: ID!) {
    disableCourse(id: $id){
      id
      name
    }
  }
`
export const DELETE_COURSE = gql`
  mutation deleteCourse($id: ID!) {
    deleteCourse(id: $id){
      done
    }
  }
`
