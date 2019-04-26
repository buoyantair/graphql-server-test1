import { combineResolvers } from 'graphql-resolvers'
import { isAuthenticated, isMessageOwner } from './authorization'

export default {
  Query: {
    messages: async (parent, { offset = 0, limit = 100 }, { models }) => {
      return models.Message.findAll({
        offset,
        limit
      })
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
    createMessage: combineResolvers(
      isAuthenticated,
      async (parent, { text }, { me, models }) => {
        return models.Message.create({
          text,
          userId: me.id
        })
      }
    ),
    deleteMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (parent, { id }, { models }) => {
        return models.Message.destroy({ where: { id } })
      }
    )
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
