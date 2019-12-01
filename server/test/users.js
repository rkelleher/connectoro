import { beforeEach, context, afterEach, test } from 'tap';
import { buildSimpleAPIServer } from '../lib/services/simpleAPIServer.js';

beforeEach(async () => {
  // TODO pass in db / mocked db
  context.server = await buildSimpleAPIServer();
  return context.server.initialize();
});

afterEach(async () => {
  return context.server.stop();
});

// test('Registering a new user', async t => {
//   const server = t.context.server;

//   const res = await server.inject({
//     method: 'post',
//     url: '/api/auth',
//     payload: {
//       email: "abc@abc.abc",
//       password: "password1"
//     }
//   });

//   t.equal(res.statusCode, 200);
//   t.end();
// });

// tap.test('Registering another user with the same email', async t => {
//   t.end();
// });

// tap.test('Trying to register with no details', async t => {
//   t.end();
// });

// tap.test('Trying to register with a short password', async t => {
//   t.end();
// });

// tap.test('Login with user/pass', async t => {
//   t.end();
// });

// tap.test('Trying to login with wrong pass', async t => {
//   t.end();
// });