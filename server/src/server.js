const express = require('express')
const cors = require('cors')
const { ApolloServer } = require('apollo-server-express')
const { loadDb } = require('./middleware/mongo')
const debug = require('debug')('virtual-exam:server')

debug('Booting up server')

// Grapqhl APIs
const { courseDefs, courseResolvers } = require('./api/course/index')

// typeDefs & resolvers
const typeDefs = [courseDefs]
const resolvers = [courseResolvers]

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  formatError: err => {
    debug({ err })
    return err
  },
  context: ({ req }) => {
    // inject request into apollo server context
    const { db } = req
    return { db }
  }
})

const app = express()

app.use(cors())
app.use(loadDb)

server.applyMiddleware({ app })

app.listen(
  { port: 4000 },
  () => {
    debug(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  }
)
