require('graphql-import-node/register')

const templateDefs = require('./typeDefs.gql')
const { resolver: templateResolvers } = require('./resolver')

module.exports = {
  templateDefs,
  templateResolvers
}
