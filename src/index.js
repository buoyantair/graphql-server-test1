import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'

import schema from './schema'
import resolvers from './resolvers'
import models, { sequelize } from './models'

const eraseDatabaseOnSync = true
const app = express()
app.use(cors())

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: async () => ({
    models,
    me: await models.User.findByLogin('Alice'),
    secret: process.env.SECRET
  }),
  formatError: err => ({
    ...err,
    message: err.message.replace('Validation error:', '').trim()
  })
})

server.applyMiddleware({ app, path: '/graphql' })

sequelize.sync({
  force: eraseDatabaseOnSync
}).then(async () => {
  if (eraseDatabaseOnSync) {
    await createUsersWithMessages()
  }

  app.listen({
    port: 4000
  }, () => {
    console.log(`Apollo server is running at http://localhost:4000/graphql`)
  })
})

const createUsersWithMessages = async () => {
  await models.User.create({
    username: 'Alice',
    email: 'alice@alice.com',
    password: 'alice9393',
    messages: [
      {
        text: 'Hello world!'
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
        text: 'Best brother ever'
      },
      {
        text: 'Pushing forward in life'
      }
    ]
  },
  {
    include: [models.Message]
  })
}
