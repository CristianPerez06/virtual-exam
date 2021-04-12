import gql from 'graphql-tag'

// requests
export const GET_UNIT = gql`
  query getUnit ($id: ID!) {
    getUnit(id: $id) {
      id
      name,
      courseId
    }
  }
`
export const LIST_UNITS = gql`
  query listUnits($q: String, $offset: Int, $limit: Int) {
    listUnits(q: $q, offset: $offset, limit: $limit) {
      data {
        id
        name,
        courseId
      }
      count
    }
  }
`
export const CREATE_UNIT = gql`
  mutation createUnit($name: String!, $courseId: ID!) {
    createUnit(name: $name, courseId: $courseId){
      id
      name,
      courseId
    }
  }
`
export const UPDATE_UNIT = gql`
  mutation updateUnit($id: ID!, $name: String!, $courseId: ID!) {
    updateUnit(id: $id, name: $name, courseId: $courseId){
      id
      name,
      courseId
    }
  }
`
export const DELETE_UNIT = gql`
  mutation deleteUnit($id: ID!) {
    deleteUnit(id: $id){
      done
    }
  }
`
