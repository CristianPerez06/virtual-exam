import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

const API = 'http://localhost:4000/graphql'

const cache = new InMemoryCache()
const link = new HttpLink({
  uri: API
})

const apolloClient = new ApolloClient({
  cache,
  link
})

export default apolloClient