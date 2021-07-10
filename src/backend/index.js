const express = require('express')
const path = require('path')
const cors = require('cors')
const { ApolloServer, AuthenticationError } = require('apollo-server-express')
const { loadDb } = require('./middleware/mongo')
const variables = require('../backend/variables')
require('dotenv').config()

const jwt = require('jsonwebtoken')
const jtp = require('jwk-to-pem')

const debug = require('debug')('virtual-exam:server')

debug('Booting up server')

const JWT_ISSUER = `https://cognito-idp.${variables.cognitoRegion}.amazonaws.com/${variables.cognitoUserPoolId}`

const jsonWebKeys = [
  {
    alg: 'RS256',
    e: 'AQAB',
    kid: '5D3vccVdROEuIyT7/gGSxF//F4WWfacMoC/qIFKc+SQ=',
    kty: 'RSA',
    n: '1pGG6GXTY32vWWKRxH6egrzUif-uI6saHdyKENt7hm1EJLIW2HVjbErW5107tzbB5HTPY1MtMK1JqQIygVrHTxQwsBaHpsDnfMxLiebbEgiOmFqMXvW8Crrb-qCrQ4XJRuzxRQV00Rpl40ccyvUoyYhqhPRVCL3XSK2P6vD3SlHLMRmCxJzJ4pkPmlG4qkH91wSN4jGvjcEznwV3zzmcMXTgQAnqvuB5ymCWZ8w8srCQAMOO0CM8178MBwC2MNpVU-3VH82Xar4E5IsK2XXdYcQ4s2tAbOofOZp2wxOcfaH5pvIXG5-cDXH-QW7uOB42e9fZIAse83l8U1e29PVpqw',
    use: 'sig'
  },
  {
    alg: 'RS256',
    e: 'AQAB',
    kid: 'X9/pbFRf8gz6k6Jw0w6sPMmDPlPOMKllmoY1rw9ZwxQ=',
    kty: 'RSA',
    n: 'vSVPZHVJxyRnXRUvs7mwm1YFq2YjVYTvM3w5pJfdO_zVdpok5xG8p1iXrUjiDkaCcCoJ7QNlEIuH7-3QaKuJF1WOArX6W0J9P40QlUveuvV3lhQl3JmtFAYnufJ30wR0FmxFGHWAlryTux1VnykflAH7sIee_PLkWrfbYGj1gbLAnU4tOtKL1td2cl1_fLWGvUSEIcCv88OVm11_9n49usL0jOtWFgpXj-zEfmtxcd_VQO0ye4Nqv4OwlGeOXoUfN_2ZdkNOfwwGYthO-WQtNI_lsVBHIykCH__DkoquXujL5gQNnKJXls2G0dU8ckwJn_xUGnGSReD-sVEW6TWsmQ',
    use: 'sig'
  }
]

const JWT_PUBLIC_KEY = jtp(jsonWebKeys[1])

// Graphql APIs
const { baseDefs, baseResolvers } = require('./api/base/index')
const { courseDefs, courseResolvers } = require('./api/course/index')
const { unitDefs, unitResolvers } = require('./api/unit/index')
const { exerciseDefs, exerciseResolvers } = require('./api/exercise/index')
const { answerDefs, answerResolvers } = require('./api/answer/index')
const { templateDefs, templateResolvers } = require('./api/template/index')
const { assignedExamDefs, assignedExamResolvers } = require('./api/assignedExam/index')
const { examDefs, examResolvers } = require('./api/exam/index')
const { metricDefs, metricResolvers } = require('./api/metric/index')

// typeDefs & resolvers
const typeDefs = [
  baseDefs,
  courseDefs,
  unitDefs,
  exerciseDefs,
  answerDefs,
  templateDefs,
  assignedExamDefs,
  examDefs,
  metricDefs
]
const resolvers = [
  baseResolvers,
  courseResolvers,
  unitResolvers,
  exerciseResolvers,
  answerResolvers,
  templateResolvers,
  assignedExamResolvers,
  examResolvers,
  metricResolvers
]

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  formatError: err => {
    debug({ err })
    return err
  },
  context: ({ req }) => {
    // inject request into apollo server context
    const { db, headers } = req

    const authorization = headers.authorization || ''
    const token = authorization.split(' ')[1]

    let user = null
    try {
      user = jwt.verify(token, JWT_PUBLIC_KEY)
    } catch (ex) {
      throw new AuthenticationError('invalid token format')
    }

    // Valid?
    if (user.iss !== JWT_ISSUER) {
      throw new AuthenticationError('issuer invalid')
    }
    if (user.client_id !== variables.cognitoClientId) {
      throw new AuthenticationError('audience invalid')
    }

    return { db }
  }
})

const app = express()

// Middlewares
app.use(cors({}))
app.use(require('compression')())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../../build')))
app.use(loadDb)

// Serve react files
app.get('/*', (req, res) => res.sendFile(path.join(__dirname, '../../build', 'index.html')))

// Routing
app.use('/', require('./utilities/router'))

server.applyMiddleware({ app })

const port = variables.port || 4000
const listener = app.listen(
  { port: port },
  (res) => {
    debug('🚀 Server ready 🚀')
    debug(`Port: ${port}`)
    debug(`Graphql path: ${server.graphqlPath}`)
    const serverAddress = listener.address().address === '::' ? 'localhost' : listener.address().address
    debug(`Server address: ${serverAddress}`)
  }
)

// app.listen(
//   { port: 4000 },
//   () => {
//     debug(`🚀 Server ready at http://localhost:${4000}${server.graphqlPath}`)
//   }
// )
