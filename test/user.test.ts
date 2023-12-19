import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { describe, it, expect, beforeAll, } from '@jest/globals'

import { prisma } from '../prisma/client'
import { getServer } from "../src/server"

describe('User Resource', () => {

    let app: FastifyInstance
    let token: string

    type AuthResponse = {
        token: string
    }

    type ErrorResponse = {
        statusCode: number,
        error: string,
        message: string,
    }

    type User = {
        id: string,
        name: string,
        email: string,
        password: string
    }

    let user1: User

    beforeAll(async function () {
        await prisma.user.deleteMany()

        app = getServer(false)

        user1 = await prisma.user.create({
            data: {
                name: 'Kumagai Saki',
                email: 'skumagai@jfa.jp',
                password: 'nadeshiko4'
            }
        })

        const result = await app.inject({
            method: 'GET',
            path: '/auth'
        })
        const response: AuthResponse = JSON.parse(result.body)
        token = response.token
    })

    it('should be able to get a user', async () => {
        const result = await app.inject({
            method: 'GET',
            path: `/users/${user1.id}`,
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        expect(JSON.parse(result.body)).toMatchObject(user1)
        expect(result.statusCode).toEqual(200)
    })

    it('should return 400 when getting with an invalid id', async () => {
        const result = await app.inject({
            method: 'GET',
            path: '/users/clearlynotauuid',
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        const response: ErrorResponse = JSON.parse(result.body)
        expect(result.statusCode).toEqual(400)
        expect(response.message).toEqual('params/id should be a valid UUID')
    })

    it('should return 404 when getting with a non-existent id', async () => {
        const result = await app.inject({
            method: 'GET',
            path: `/users/${randomUUID()}`,
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        const response: ErrorResponse = JSON.parse(result.body)
        expect(result.statusCode).toEqual(404)
        expect(response.message).toEqual('User with this id can not be found')
    })

    it('should be able to update a user',async () => {
        const updated_user = {
            name: 'Kumagai Saki',
            email: 'skumagai@jfa.jp',
            password: 'nadeshikoCaptain'
        }
        const result = await app.inject({
            method: 'PUT',
            path: `/users/${user1.id}`,
            payload: {
                password: 'nadeshikoCaptain'
            },
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        expect(JSON.parse(result.body)).toMatchObject(updated_user)
        expect(result.statusCode).toEqual(200)
    })

    it('should return 400 when modifying with an empty body', async () => {
        const result = await app.inject({
            method: 'PUT',
            path: `/users/${user1.id}`,
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        const response: ErrorResponse = JSON.parse(result.body)
        expect(result.statusCode).toEqual(400)
        expect(response.message).toEqual('body must be object')
    })

    it('should return 400 when modifying with an invalid id', async () => {
        const result = await app.inject({
            method: 'PUT',
            path: '/users/clearlynotauuid',
            payload: {
                name: 'Yamada Tae'
            },
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        const response: ErrorResponse = JSON.parse(result.body)
        expect(result.statusCode).toEqual(400)
        expect(response.message).toEqual('params/id should be a valid UUID')
    })

    it('should return 404 when modifying a non-existent id', async () => {
        const result = await app.inject({
            method: 'PUT',
            path: `/users/${randomUUID()}`,
            payload: {
                name: 'Yamada Tae'
            },
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        const response: ErrorResponse = JSON.parse(result.body)
        expect(result.statusCode).toEqual(404)
        expect(response.message).toEqual('User with this id can not be found')
    })

    it('should be able to create a user', async () => {
        const new_user = {
            name: 'Miyake Shiori',
            email: 'smiyake@jfa.jp',
            password: 'nadeshiko5'
        }
        const result = await app.inject({
            method: 'POST',
            path: '/users',
            payload: new_user,
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        expect(result.statusCode).toEqual(200)
        expect(JSON.parse(result.body)).toMatchObject(new_user)
    })

    it('should return 400 when creating with an empty body', async () => {
        const result = await app.inject({
            method: 'POST',
            path: '/users',
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        const response: ErrorResponse = JSON.parse(result.body)
        expect(result.statusCode).toEqual(400)
        expect(response.message).toEqual('body must be object')
    })

    it('should return 400 when creating with missing fields', async () => {
        const result = await app.inject({
            method: 'POST',
            path: '/users',
            payload: {
                name: 'Sugita Hina',
                password: 'nadeshiko6'
            },
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        const response: ErrorResponse = JSON.parse(result.body)
        expect(result.statusCode).toEqual(400)
        expect(response.message).toEqual("body must have required property 'email'")
    })

    it('should return 400 when creating with invalid email', async () => {
        const result = await app.inject({
            method: 'POST',
            path: '/users',
            payload: {
                name: 'Miyazawa Hinata',
                email: 'notanemail',
                password: 'nadeshiko7'
            },
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        const response: ErrorResponse = JSON.parse(result.body)
        expect(result.statusCode).toEqual(400)
        expect(response.message).toEqual('body/email should be a valid email address')
    })

    it('should return 400 when creating with a too short password', async () => {
        const result = await app.inject({
            method: 'POST',
            path: '/users',
            payload: {
                name: 'Naomoto Hikaru',
                email: 'hnaomoto@jfa.jp',
                password: 'nao'
            },
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        const response: ErrorResponse = JSON.parse(result.body)
        expect(result.statusCode).toEqual(400)
        expect(response.message).toEqual('body/password should be a at least 8 characters long')
    })

    it('should be able to delete a user', async () => {
        const result = await app.inject({
            method: 'DELETE',
            path: `/users/${user1.id}`,
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        expect(result.statusCode).toEqual(200)
    })

    it('should return 404 when deleting a non-existent id', async () => {
        const result = await app.inject({
            method: 'DELETE',
            path: `/users/${randomUUID()}`,
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        const response: ErrorResponse = JSON.parse(result.body)
        expect(result.statusCode).toEqual(404)
        expect(response.message).toEqual('User with this id can not be found')
    })

    it('should return 400 when deleting with an invalid id', async () => {
        const result = await app.inject({
            method: 'DELETE',
            path: '/users/clearlynotauuid',
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        const response: ErrorResponse = JSON.parse(result.body)
        expect(result.statusCode).toEqual(400)
        expect(response.message).toEqual('params/id should be a valid UUID')
    })
})