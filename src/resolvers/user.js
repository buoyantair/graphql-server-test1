export default {
  Query: {
    users: async (parent, args, { models }) => {
      return models.User.findAll()
    },
    user: async (parent, { id }, { models }) => {
      return models.User.findOne({
        where: {
          id
        }
      })
    },
    me: async (parent, args, { models, me }) => {
      return models.User.findOne({
        where: {
          id: me.id
        }
      })
    }
  },

  User: {
    messages: async (user, args, { models }) => {
      return models.Message.findAll({
        where: {
          userId: user.id
        }
      })
    }
  }
}
