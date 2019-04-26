import { combineResolvers } from 'graphql-resolvers'
import { isAuthenticated, isMessageOwner } from './authorization'
import * as Sequelize from 'sequelize';

const toCursorHash = string => Buffer.from(string).toString('base64')
const fromCursorHash = string => Buffer.from(string, 'base64').toString('ascii')

export default {
  Query: {
    messages: async (parent, { cursor, limit = 100 }, { models }) => {
      const cursorOptions = cursor
        ? {
          where: {
            createdAt: {
              [Sequelize.Op.lt]: fromCursorHash(cursor),
            },
          },
        }
        : {};

      const messages = await models.Message.findAll({
        order: [['createdAt', 'DESC']],
        limit: limit + 1,
        ...cursorOptions
      })

      const hasNextPage = messages.length > limit
      const edges = hasNextPage ? messages.slice(0, -1) : messages

      return {
        edges,
        pageInfo: {
          endCursor: edges.length ? toCursorHash(edges[edges.length - 1].createdAt.toString()) : cursor,
          hasNextPage
        }
      }
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
