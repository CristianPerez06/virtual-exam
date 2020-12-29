require('graphql-import-node/register')

const userDefs = require('./typeDefs.gql')
const { resolver: userResolvers } = require('./resolver')

module.exports = {
  userDefs,
  userResolvers
}