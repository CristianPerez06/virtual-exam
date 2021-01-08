require('graphql-import-node/register')

const courseDefs = require('./typeDefs.gql')
const { resolver: courseResolvers } = require('./resolver')

module.exports = {
  courseDefs,
  courseResolvers
}