const resolver = {
  Query: {
    getUsers: async () => [{ id: 1, userName: 'user', email: 'an_email' }]
  },
  Mutation: {
    addUser: async (_, args) => {
      try {
        return { id: 1, userName: 'user', email: 'an_email' }
      } catch (e) {
        return e.message
      }
    }
  }
}

module.exports = {
  resolver
}