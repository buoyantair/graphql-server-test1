
export default {
  Query: {
    messages: async (parent, args, { models }) => {
      return models.Message.findAll()
    },
    message: async (parent, { id }, { models }) => {
      return models.Message.findOne({
        where: {
          id
        }
      })
    }
  },

  Mutation: {
    createMessage: async (parent, { text }, { me, models }) => {
      return models.Message.create({
        text,
        userId: me.id
      })
    },

    deleteMessage: async (parent, { id }, { models }) => {
      return models.Message.destroy({ where: { id } })
    }
  },

  Message: {
    user: async (message, args, { models }) => {
      return models.User.findOne({
        where: {
          id: message.userId
        }
      })
    }
  }
}
