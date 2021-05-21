require('graphql-import-node/register')

const answerDefs = require('./typeDefs.gql')
const { resolver: answerResolvers } = require('./resolver')

module.exports = {
  answerDefs,
  answerResolvers
}
