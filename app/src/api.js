import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { ApolloLink } from 'apollo-link'
import { onError } from 'apollo-link-error'
import Cookies from 'js-cookie'
import { COOKIE_NAMES, GRAPHQL_ERRORS } from './common/constants'

const API = 'http://localhost:4000/graphql'

const httpLink = new HttpLink({
  uri: API
})

const authLink = new ApolloLink((operation, forward) => {
  const token = Cookies.get(COOKIE_NAMES.TOKEN)

  const headers = {
    authorization: token ? `Bearer ${token}` : ''
  }

  operation.setContext({
    headers
  })

  return forward(operation)
})

const errorLink = onError(({ operation, response, graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    const gqlErrors = graphQLErrors.map(({ message, extensions, locations, path }) => {
      console.log(`[GraphQL error]: Message: ${message}, Extensions: ${extensions}, Location: ${locations}, Path: ${path}`)
      return extensions.code
    })

    // If authentication error then logout the user
    const authErrorExists = gqlErrors.includes(GRAPHQL_ERRORS.UNAUTHENTICATED)
    if (authErrorExists) {
      window.location.replace('/login')
    }
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError}`)
  }
  return null
})

const apolloClient = new ApolloClient({
  link: ApolloLink.from([
    errorLink,
    authLink,
    httpLink
  ]),
  cache: new InMemoryCache()
})

export default apolloClient
