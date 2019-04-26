import { combineResolvers } from 'graphql-resolvers'
import { isAuthenticated, isMessageOwner } from './authorization'
import * as Sequelize from 'sequelize';

export default {
  Query: {
    messages: async (parent, { cursor, limit = 100 }, { models }) => {
      const cursorOptions = cursor
        ? {
          where: {
            createdAt: {
              [Sequelize.Op.lt]: cursor,
            },
          },
        }
        : {};
      return models.Message.findAll({
        order: [['createdAt', 'DESC']],
        limit,
        ...cursorOptions
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
