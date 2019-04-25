import jwt from 'jsonwebtoken'

const createToken = async (user, secret, expiresIn) => {
  const { id, email, username } = user
  return jwt.sign({
    id,
    email,
    username
  }, secret, {
    expiresIn
  })
}

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
  Mutation: {
    signUp: async (parent, { username, email, password }, { models, secret }) => {
      const user = await models.User.create({
        username,
        email,
        password
      })

      return {
        token: createToken(user, secret, '30m')
      }
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
