import gql from 'graphql-tag'

// requests
export const GET_ANSWER = gql`
  query getAnswer ($id: ID!) {
    getAnswer(id: $id) {
      id
      name
      description
      descriptionUrl
      correct
    }
  }
`
export const LIST_ANSWERS = gql`
  query listAnswers($exerciseId: ID!) {
    listAnswers(exerciseId: $exerciseId) {
      data {
        id
        name
        description
        correct
        exerciseId
      }
      count
    }
  }
`
export const CREATE_ANSWER = gql`
  mutation createAnswer($name: String!, $description: String, $correct: Boolean, $exerciseId: ID!) {
    createAnswer(name: $name, description: $description, correct: $correct, exerciseId: $exerciseId){
      id
      name
      description
      correct,
      exerciseId
    }
  }
`
export const UPDATE_ANSWER = gql`
  mutation updateAnswer($id: ID!, $name: String!, $description: String, $correct: Boolean, $exerciseId: ID!) {
    updateAnswer(id: $id, name: $name, description: $description, correct: $correct, exerciseId: $exerciseId){
      id
      name
      description
      descriptionUrl
      correct
      exerciseId
    }
  }
`
export const UPDATE_ANSWER_DESCRIPTION_URL = gql`
  mutation updateAnswerDescriptionUrl($id: ID!, $descriptionUrl: String!) {
    updateAnswerDescriptionUrl(id: $id, descriptionUrl: $descriptionUrl){
      id
      descriptionUrl
    }
  }
`
export const DISABLE_ANSWER = gql`
  mutation disableAnswer($id: ID!) {
    disableAnswer(id: $id){
      id
      name
      description
      correct,
      exerciseId
    }
  }
`
export const DELETE_ANSWER = gql`
  mutation deleteAnswer($id: ID!) {
    deleteAnswer(id: $id){
      done
    }
  }
`
