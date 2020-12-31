const express = require('express')
const cors = require('cors')
const { ApolloServer } = require('apollo-server-express')
const { loadDb } = require('./middleware/mongo')
const debug = require('debug')('virtual-exam:server')

debug('Booting up server')

// Grapqhl APIs
const { userDefs, userResolvers } = require('./api/user/index')

// typeDefs & resolvers
const typeDefs = [userDefs]
const resolvers = [userResolvers]

const server = new ApolloServer({ typeDefs, resolvers })

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
