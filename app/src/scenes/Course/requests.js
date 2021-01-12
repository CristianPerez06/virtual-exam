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
  query listCourses($q: String, $offset: Int, $limit: Int) {
    listCourses(q: $q, offset: $offset, limit: $limit) {
      id
      name
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
export const DELETE_COURSE = gql`
  mutation deleteCourse($id: ID!) {
    deleteCourse(id: $id){
      done
    }
  }
`
