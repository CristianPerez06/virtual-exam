require('graphql-import-node/register')

const examDefs = require('./typeDefs.gql')
const { resolver: examResolvers } = require('./resolver')

module.exports = {
  examDefs,
  examResolvers
}
