require('graphql-import-node/register')

const baseDefs = require('./typeDefs.gql')
const { resolver: baseResolvers } = require('./resolver')

module.exports = {
  baseDefs,
  baseResolvers
}
