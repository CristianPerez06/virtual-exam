import gql from 'graphql-tag'

// requests
export const GET_USERS = gql`
  query getUsers {
    getUsers {
      id
      userName
      email
    }
  }
`