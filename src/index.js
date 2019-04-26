import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { ApolloServer, AuthenticationError } from 'apollo-server-express'
import jwt from 'jsonwebtoken'
import http from 'http'
import DataLoader from 'dataloader'

import schema from './schema'
import resolvers from './resolvers'
import models, { sequelize } from './models'
import loaders from './loaders'

const app = express()
app.use(cors())

const getMe = async req => {
  const token = req.headers['x-token']

  if (token) {
    try {
      return jwt.verify(token, process.env.SECRET)
    } catch (e) {
      throw new AuthenticationError('Your session expired, please sign in again')
    }
  }
}

const server = new ApolloServer({
  introspection: true,
  playground: true,
  typeDefs: schema,
  resolvers,
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models,
        loaders: {
          user: new DataLoader(keys =>
            loaders.user.batchUsers(keys, models),
          ),
        }
      }
    }

    if (req) {
      const me = await getMe(req)

      return {
        models,
        me,
        secret: process.env.SECRET,
        loaders: {
          user: new DataLoader(keys =>
            loaders.user.batchUsers(keys, models),
          ),
        }
      }
    }

  },
  formatError: err => ({
    ...err,
    message: err.message.replace('Validation error:', '').trim()
  })
})

server.applyMiddleware({ app, path: '/graphql' })

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

const isTest = !!process.env.TEST_DATABASE
const port = process.env.PORT || 4000
sequelize.sync({
  force: isTest
}).then(async () => {
  if (isTest) {
    await createUsersWithMessages(new Date())
  }

  httpServer.listen({
    port,
  }, () => {
    console.log(`Apollo server is running at http://localhost:4000/graphql`)
  })
})

const createUsersWithMessages = async date => {
  await models.User.create({
    username: 'Alice',
    email: 'alice@alice.com',
    password: 'alice9393',
    role: 'ADMIN',
    messages: [
      {
        text: 'Hello world!',
        createdAt: date.setSeconds(date.getSeconds() + 1)
      }
    ]
  },
    {
      include: [models.Message]
    })

  await models.User.create({
    username: 'Louis',
    email: 'louis@louis.com',
    password: 'louis9393',
    messages: [
      {
        text: 'Best brother ever',
        createdAt: date.setSeconds(date.getSeconds() + 1)
      },
      {
        text: 'Pushing forward in life',
        createdAt: date.setSeconds(date.getSeconds() + 1)
      }
    ]
  },
    {
      include: [models.Message]
    })
}
