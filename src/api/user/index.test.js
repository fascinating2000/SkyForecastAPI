import request from 'supertest'
import { masterKey } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import routes, { User } from '.'

const app = () => express(routes)

let user1, user2, admin, session1, session2, adminSession

beforeEach(async() => {
    user1 = await User.create({ name: 'user', email: 'a@a.com', password: '123456' })
    user2 = await User.create({ name: 'user', email: 'b@b.com', password: '123456' })
    admin = await User.create({ name: 'admin', email: 'c@c.com', password: '123456', role: 'admin' })
    session1 = signSync(user1.id)
    session2 = signSync(user2.id)
    adminSession = signSync(admin.id)
})

test('GET /users 200 (admin)', async() => {
    const { status, body } = await request(app())
        .get('/')
        .query({ access_token: adminSession })
    expect(status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
})

test('GET /users?page=2&limit=1 200 (admin)', async() => {
    const { status, body } = await request(app())
        .get('/')
        .query({ access_token: adminSession, page: 2, limit: 1 })
    expect(status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(1)
})

test('GET /users?q=user 200 (admin)', async() => {
    const { status, body } = await request(app())
        .get('/')
        .query({ access_token: adminSession, q: 'user' })
    expect(status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(2)
})

test('GET /users?fields=name 200 (admin)', async() => {
    const { status, body } = await request(app())
        .get('/')
        .query({ access_token: adminSession, fields: 'name' })
    expect(status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    expect(Object.keys(body[0])).toEqual(['id', 'name'])
})

test('GET /users 401 (user)', async() => {
    const { status } = await request(app())
        .get('/')
        .query({ access_token: session1 })
    expect(status).toBe(401)
})

test('GET /users 401', async() => {
    const { status } = await request(app())
        .get('/')
    expect(status).toBe(401)
})

test('GET /users/me 200 (user)', async() => {
    const { status, body } = await request(app())
        .get('/me')
        .query({ access_token: session1 })
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.id).toBe(user1.id)
})

test('GET /users/me 401', async() => {
    const { status } = await request(app())
        .get('/me')
    expect(status).toBe(401)
})

test('GET /users/:id 200', async() => {
    const { status, body } = await request(app())
        .get(`/${user1.id}`)
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.id).toBe(user1.id)
})

test('GET /users/:id 404', async() => {
    const { status } = await request(app())
        .get('/123456789098765432123456')
    expect(status).toBe(404)
})

test('POST /users 201 Role(default : user)', async() => {
    const { status, body } = await request(app())
        .post('/')
        .send({ email: 'd@d.com', password: '123456', name: "Tester" })
    expect(status).toBe(201)
    expect(typeof body).toBe('object')
    expect(body.email).toBe('d@d.com')
    expect(body.role).toBe('user')
})

test('POST /users 201 Role(user)', async() => {
    const { status, body } = await request(app())
        .post('/')
        .send({ email: 'd@d.com', password: '123456', role: 'user', name: "Tester" })
    expect(status).toBe(201)
    expect(typeof body).toBe('object')
    expect(body.email).toBe('d@d.com')
    expect(body.role).toBe('user')
})

test('POST /users 201 Role(admin)', async() => {
    const { status, body } = await request(app())
        .post('/')
        .send({ email: 'd@d.com', password: '123456', role: 'admin', name: "Tester" })
    expect(status).toBe(201)
    expect(typeof body).toBe('object')
    expect(body.email).toBe('d@d.com')
    expect(body.role).toBe('admin')
})

test('POST /users 409 - duplicated email', async() => {
    const { status, body } = await request(app())
        .post('/')
        .send({ email: 'a@a.com', password: '123456', name: "Tester" })
    expect(status).toBe(409)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('email')
})

test('POST /users 400 - missing name', async() => {
    const { status, body } = await request(app())
        .post('/')
        .send({ email: 'd@d.com', password: '123456' })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('name')
})

test('POST /users 400 - invalid email', async() => {
    const { status, body } = await request(app())
        .post('/')
        .send({ email: 'invalid', password: '123456', name: "Tester" })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('email')
})

test('POST /users 400 - missing email', async() => {
    const { status, body } = await request(app())
        .post('/')
        .send({ password: '123456', name: "Tester" })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('email')
})

test('POST /users 400 - invalid password', async() => {
    const { status, body } = await request(app())
        .post('/')
        .send({ email: 'd@d.com', password: '123', name: "Tester" })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('password')
})

test('POST /users 400 - missing password', async() => {
    const { status, body } = await request(app())
        .post('/')
        .send({ email: 'd@d.com', name: "Tester" })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('password')
})

test('POST /users 400 - invalid role', async() => {
    const { status, body } = await request(app())
        .post('/')
        .send({ email: 'd@d.com', password: '123456', name: 'Tester', role: 'invalid' })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('role')
})

test('PUT /users/me 200 (user)', async() => {
    const { status, body } = await request(app())
        .put('/me')
        .send({ access_token: session1, name: 'test' })
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.name).toBe('test')
})

test('PUT /users/me 200 (user)', async() => {
    const { status, body } = await request(app())
        .put('/me')
        .send({ access_token: session1, email: 'test@test.com' })
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.email).toBe('test@test.com')
})

test('PUT /users/me 401', async() => {
    const { status } = await request(app())
        .put('/me')
        .send({ name: 'test' })
    expect(status).toBe(401)
})

test('PUT /users/:id 200 (user)', async() => {
    const { status, body } = await request(app())
        .put(`/${user1.id}`)
        .send({ access_token: session1, name: 'test' })
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.name).toBe('test')
})

test('PUT /users/:id 200 (user)', async() => {
    const { status, body } = await request(app())
        .put(`/${user1.id}`)
        .send({ access_token: session1, email: 'test@test.com' })
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.email).toBe('test@test.com')
})

test('PUT /users/:id 200 (admin)', async() => {
    const { status, body } = await request(app())
        .put(`/${user1.id}`)
        .send({ access_token: adminSession, name: 'test' })
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.name).toBe('test')
})

test('PUT /users/:id 401 (user) - another user', async() => {
    const { status } = await request(app())
        .put(`/${user1.id}`)
        .send({ access_token: session2, name: 'test' })
    expect(status).toBe(401)
})

test('PUT /users/:id 401', async() => {
    const { status } = await request(app())
        .put(`/${user1.id}`)
        .send({ name: 'test' })
    expect(status).toBe(401)
})

test('PUT /users/:id 404 (admin)', async() => {
    const { status } = await request(app())
        .put('/123456789098765432123456')
        .send({ access_token: adminSession, name: 'test' })
    expect(status).toBe(404)
})

const passwordMatch = async(password, userId) => {
    const user = await User.findById(userId)
    return !!await user.authenticate(password)
}

test('PUT /users/me/password 200 (user)', async() => {
    const { status, body } = await request(app())
        .put('/me/password')
        .auth('a@a.com', '123456')
        .send({ password: '654321' })
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.email).toBe('a@a.com')
    expect(await passwordMatch('654321', body.id)).toBe(true)
})

test('PUT /users/me/password 400 (user) - invalid password', async() => {
    const { status, body } = await request(app())
        .put('/me/password')
        .auth('a@a.com', '123456')
        .send({ password: '321' })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('password')
})

test('PUT /users/me/password 401 (user) - invalid authentication method', async() => {
    const { status } = await request(app())
        .put('/me/password')
        .send({ access_token: session1, password: '654321' })
    expect(status).toBe(401)
})

test('PUT /users/me/password 401', async() => {
    const { status } = await request(app())
        .put('/me/password')
        .send({ password: '654321' })
    expect(status).toBe(401)
})

test('PUT /users/:id/password 200 (user)', async() => {
    const { status, body } = await request(app())
        .put(`/${user1.id}/password`)
        .auth('a@a.com', '123456')
        .send({ password: '654321' })
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.email).toBe('a@a.com')
    expect(await passwordMatch('654321', body.id)).toBe(true)
})

test('PUT /users/:id/password 400 (user) - invalid password', async() => {
    const { status, body } = await request(app())
        .put(`/${user1.id}/password`)
        .auth('a@a.com', '123456')
        .send({ password: '321' })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('password')
})

test('PUT /users/:id/password 401 (user) - another user', async() => {
    const { status } = await request(app())
        .put(`/${user1.id}/password`)
        .auth('b@b.com', '123456')
        .send({ password: '654321' })
    expect(status).toBe(401)
})

test('PUT /users/:id/password 401 (user) - invalid authentication method', async() => {
    const { status } = await request(app())
        .put(`/${user1.id}/password`)
        .send({ access_token: session1, password: '654321' })
    expect(status).toBe(401)
})

test('PUT /users/:id/password 401', async() => {
    const { status } = await request(app())
        .put(`/${user1.id}/password`)
        .send({ password: '654321' })
    expect(status).toBe(401)
})

test('PUT /users/:id/password 404 (user)', async() => {
    const { status } = await request(app())
        .put('/123456789098765432123456/password')
        .auth('a@a.com', '123456')
        .send({ password: '654321' })
    expect(status).toBe(404)
})

test('DELETE /users/:id 204 (admin)', async() => {
    const { status } = await request(app())
        .delete(`/${user1.id}`)
        .send({ access_token: adminSession })
    expect(status).toBe(204)
})

test('DELETE /users/:id 401 (user)', async() => {
    const { status } = await request(app())
        .delete(`/${user1.id}`)
        .send({ access_token: session1 })
    expect(status).toBe(401)
})

test('DELETE /users/:id 401', async() => {
    const { status } = await request(app())
        .delete(`/${user1.id}`)
    expect(status).toBe(401)
})

test('DELETE /users/:id 404 (admin)', async() => {
    const { status } = await request(app())
        .delete('/123456789098765432123456')
        .send({ access_token: adminSession })
    expect(status).toBe(404)
})