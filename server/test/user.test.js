import t from 'tap';
import { setupTestDB, setupCg, setupTestServer, teardownTestDB,
  stopTestServer, initializeTestServer, clearTestDB } from '../lib/testUtils.js';
import { User } from '../lib/models/user.model.js';

(async () => {
  setupCg(t.context);
  await setupTestDB(t.context);
  await setupTestServer(t.context);

  t.beforeEach(async () => {
    return initializeTestServer(t.context);
  });

  t.afterEach(async () => {
    await clearTestDB(t.context);
    return stopTestServer(t.context);
  });

  t.tearDown(async () => {
    return teardownTestDB(t.context);
  })

  t.test('User: ', async t => {
    t.test('login before registering', async t => {
      const res = await t.context.server.inject({
        method: 'post',
        url: '/api/auth',
        payload: {
          email: "abc@abc.abc",
          password: "password1"
        }
      });
      t.equal(res.statusCode, 401);
      t.end()
    })

    t.test('successful registration', async t => {
      t.equal(await User.count(), 0);
      const res = await t.context.server.inject({
        method: 'post',
        url: '/api/auth/register',
        payload: {
          displayName: "abc",
          email: "abc@abc.abc",
          password: "password1"
        }
      });
      t.equal(res.statusCode, 200);
      t.equal(await User.count(), 1);
      t.type(res.payload, 'string')
      const parsedResponse = JSON.parse(res.payload);
      const token = parsedResponse.token;
      t.type(token, 'string');

      t.test('then authenticate with a valid token', async t => {
        t.equal(await User.count(), 1);
        const res = await t.context.server.inject({
          method: 'get',
          url: '/api/auth/access-token',
          headers: {
            'Authorization': 'Bearer ' + token
          }
        })
        t.equal(res.statusCode, 200);
        const parsedResponse = JSON.parse(res.payload);
        t.equal(parsedResponse.user.data.displayName, 'abc');

        t.test('then registering another user with the same email', async t => {
          t.equal(await User.count(), 1)
          const res = await t.context.server.inject({
            method: 'post',
            url: '/api/auth/register',
            payload: {
              displayName: "foo",
              email: "abc@abc.abc",
              password: "password2"
            }
          });
          t.equal(res.statusCode, 400);
          t.equal(await User.count(), 1)
          t.end();
        })
        t.end();
      })
      t.end();
    })

    t.test('register with bad values', async t => {
      const res = await t.context.server.inject({
        method: 'post',
        url: '/api/auth/register',
        payload: {
          email: "abc@abc.abc",
          password: "password1"
        }
      });
      t.equal(res.statusCode, 400);
      t.end();
    })
    t.end();
  });

  t.test('Trying to authenticate without a token', async t => {
    const res = await t.context.server.inject({
      method: 'get',
      url: '/api/auth/access-token'
    });

    t.equal(res.statusCode, 401);
    t.end();
  })

  // tap.test('Trying to authenticate with bad token', async t => {
  //   t.end();
  // });

  // tap.test('', async t => {
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
})();
