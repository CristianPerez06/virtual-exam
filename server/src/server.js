const express = require('express')
const cors = require('cors')
const { ApolloServer, AuthenticationError } = require('apollo-server-express')
const { loadDb } = require('./middleware/mongo')

const jwt = require('jsonwebtoken')
const jtp = require('jwk-to-pem')

const debug = require('debug')('virtual-exam:server')

debug('Booting up server')

const POOL_REGION = 'us-east-2'
const COGNITO_USER_POOL_ID = 'us-east-2_eUKPzGh9X'
const COGNITO_APP_CLIENT_ID = '5fm1ctb7h941c7iei3llda67nc'
const JWT_ISSUER = `https://cognito-idp.${POOL_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`

const jsonWebKeys = [
  {
    alg: 'RS256',
    e: 'AQAB',
    kid: 'v7KOmnEvgsBPkfc5HU++NwXv+772fyjM2gIzylmpX+c=',
    kty: 'RSA',
    n: '4UAeHc9kaV0KYuRI_MkDYimLiDCECTZsanMPEbpJxWfDFrlNgz-9xIwBbkc_-ND5Khkv_yJ7Gk5X101G784hny4jJXmRjLiFts6DmYXVtzW4crOcDPAvmbNio3wvJEQ6rQudz91pnFlK71wrxfzo_1vV1nyCXSEVPqZLHiea2CdEWpk1TNpXwayO_KugTIqRiLIj2X6a1Cslf_gD7xaOwD90yNorNkrqE8bo-CcGhVOGC469_ISjHKYOJ7RcQD3moy74a7Z0mhqsp4DfcxryTITkD85BZmgS-dxSwxSVqWFiph0B6KAf7hTLrQWG4h9io2ivbtbE__OTB9BrIE-BnQ',
    use: 'sig'
  },
  {
    alg: 'RS256',
    e: 'AQAB',
    kid: 'YeK81yY0v4ebSaVdtUCE9OqWjQq4nEknZuA+AfVfi+M=',
    kty: 'RSA',
    n: 's8dveYlkwqQamAyoK6IwvN_NKgsAfXC7pX0n7gKJbdwH-UC18ieGCKkNBpWpVIftqgdyiG7B75sj3yMItl8bf9M-enrhAISJHp0qzhuZre7jxgQrdMyhFObF8G7D2iLjjLAC8NA5SfMwBOBhFvWBI2tidliwSlZGTHSLrYjCDb5Rm8T__O-7ZE2AX5IEk4iNJXBalgnbySXVQpgKG-MPQIml-SPptD3CTMw1llliH2uo9Kgs_Vd_i4EqmFPQhTdF9hLDVc29lvTI4Utm_1C7I6ur05vuIT6EMydKUHMqNnzUtr9fVMUL6Q7Qio16c8K0x8tv74UzLdxEMaQdj9wosQ',
    use: 'sig'
  }
]

const JWT_PUBLIC_KEY = jtp(jsonWebKeys[1])

// Grapqhl APIs
const { baseDefs, baseResolvers } = require('./api/base/index')
const { courseDefs, courseResolvers } = require('./api/course/index')
const { unitDefs, unitResolvers } = require('./api/unit/index')
const { exerciseDefs, exerciseResolvers } = require('./api/exercise/index')
const { answerDefs, answerResolvers } = require('./api/answer/index')

// typeDefs & resolvers
const typeDefs = [baseDefs, courseDefs, unitDefs, exerciseDefs, answerDefs]
const resolvers = [baseResolvers, courseResolvers, unitResolvers, exerciseResolvers, answerResolvers]

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
    if (user.client_id !== COGNITO_APP_CLIENT_ID) {
      throw new AuthenticationError('audience invalid')
    }

    return { db }
  }
})

const app = express()

app.use(cors({
  // TO DO
  // origin: 'http://localhost:3001',
  // credentials: true
}))
app.use(loadDb)

server.applyMiddleware({ app })

app.listen(
  { port: 4000 },
  () => {
    debug(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  }
)
