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

test('Trying to authenticate without a token', async t => {
  const server = t.context.server;

  const res = await server.inject({
    method: 'get',
    url: '/api/auth/access-token'
  });

  t.equal(res.statusCode, 401);
  t.end();
})

// tap.test('Trying to authenticate with bad token', async t => {
//   t.end();
// });

// tap.test('Authenticating with a token', async t => {
//   t.end();
// });