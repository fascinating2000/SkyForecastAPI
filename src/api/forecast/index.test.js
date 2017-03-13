import request from 'supertest'
import { User } from '../user'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import routes from '.'

const app = () => express(routes)

let user,userToken

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456', name: 'Tester', history: ['sample']})
  userToken = signSync(user.id)
})

test('POST /forecast 401 unauthorized request', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ lat: 43.6532, lng: 79.3832 })
  expect(status).toBe(401)
})

test('POST /forecast 400 missing place', async () => {
  const { status, body } = await request(app())
    .post('/')
    .set('Authorization', 'Bearer ' + userToken)
    .send({ lat: 43.6532, lng: 79.3832 })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('place')
})

test('POST /forecast 400 missing lattitude(longitute)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .set('Authorization', 'Bearer ' + userToken)
    .send({ place: 'Toronto', lng: 79.3832 })
  expect(status).toBe(400)
  expect(typeof body).toBe('object')
  expect(body.param).toBe('lat')
})

test('POST /forecast 200 missing lattitude(longitute)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .set('Authorization', 'Bearer ' + userToken)
    .send({ place: 'Toronto', lat: 43.6532, lng: 79.3832 })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.latitude).toBe(43.6532)
  expect(body.longitude).toBe(79.3832)
})

// test('POST /auth 400 - invalid email', async () => {
//   const { status, body } = await request(app())
//     .post('/')
//     .auth('invalid', '123456')
//   expect(status).toBe(400)
//   expect(typeof body).toBe('object')
//   expect(body.param).toBe('email')
// })

// test('POST /auth 400 - invalid password', async () => {
//   const { status, body } = await request(app())
//     .post('/')    
//     .auth('a@a.com', '123')
//   expect(status).toBe(400)
//   expect(typeof body).toBe('object')
//   expect(body.param).toBe('password')
// })

// test('POST /auth 401 - user does not exist', async () => {
//   const { status } = await request(app())
//     .post('/')
//     .auth('b@b.com', '123456')
//   expect(status).toBe(401)
// })

// test('POST /auth 401 - wrong password', async () => {
//   const { status } = await request(app())
//     .post('/')
//     .auth('a@a.com', '654321')
//   expect(status).toBe(401)
// })

// test('POST /auth 401 (master) - missing auth', async () => {
//   const { status } = await request(app())
//     .post('/')
//   expect(status).toBe(401)
// })
