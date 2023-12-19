import fastify, { FastifyInstance } from 'fastify'
import fastifyJwt, { FastifyJWTOptions } from '@fastify/jwt'
import fastifySensible from "@fastify/sensible";

import { prisma, PrismaClient } from '../prisma/client'
import { paramsJsonSchema, bodyJsonSchema, putBodyJsonSchema } from './users.schema'

export function getServer(logging: boolean = true): FastifyInstance {
  const app = fastify({ 
    logger: logging,
      ajv: {
        customOptions: {
          allErrors: true
        },
        plugins: [
          require('ajv-errors')
        ]
      }
    })
    
  app.register(require('@fastify/jwt'), {
    secret: 'gokuhijouhou'
  })
  app.register(require('@fastify/sensible'))
  
  app.decorate("authenticate", async (req: any, res: any): Promise<any> => {
    try {
      await req.jwtVerify()
    } catch (err) {
      res.send(err)
    }
  })
  
  async function getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  }
  
  async function getUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }
  
  app.get('/auth', async (req, res) => {
    const token = app.jwt.sign({ user: 'admin' })
    return { token }
  })
  
  app.post<{
    Body: IUserBody
  }>('/users', { 
    schema: {
      body: bodyJsonSchema
    },
    onRequest: [ app.authenticate ]
  }, async (req, res) => {
    const { name, email, password } = req.body
  
    const existing = await getUserByEmail(email);
    if ( existing ) {
      throw app.httpErrors.conflict('This email is already in use')
    }

    const result = await prisma.user.create({
      data: {
        name,
        email,
        password,
      }
    })
  
    return result
  })

  app.delete<{
    Params: IUserIdParam
  }>(`/users/:id`, { 
    schema: {
      params: paramsJsonSchema
    },
    onRequest: [ app.authenticate ]
  }, async (req, res) => {
    const { id } = req.params

    const existing = await getUserById(id);
    if ( !existing ) {
      throw app.httpErrors.notFound('User with this id can not be found')
    }

    const post = await prisma.user.delete({
      where: {
        id,
      },
    })
    return post
  })

  app.put<{
    Params: IUserIdParam,
    Body: IUserBody
  }>('/users/:id',{ 
    schema: {
      params: paramsJsonSchema,
      body: putBodyJsonSchema
    },
    onRequest: [ app.authenticate ]
  }, async (req, res) => {
    const { id } = req.params
    const { name, email, password } = req.body
  
    const existing = await getUserById(id);
    if ( !existing ) {
      throw app.httpErrors.notFound('User with this id can not be found')
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        password
    }})
    return user
  })

  app.get<{
    Params: IUserIdParam
  }>('/users/:id', { 
    schema: {
      params: paramsJsonSchema
    },
    onRequest: [ app.authenticate ]
  }, async (req, res) => {
    const { id } = req.params

    const existing = await getUserById(id);
    if ( !existing ) {
      throw app.httpErrors.notFound('User with this id can not be found')
    }
    return existing
  })

  app.get('/users', {
    onRequest: [ app.authenticate ],
  }, async (req, res) => {
    const users = await prisma.user.findMany()
    return users
  })
  return app
}