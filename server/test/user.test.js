import t from 'tap';
import { setupTestDB, setupCg, setupTestServer, teardownTestDB,
  stopTestServer, initializeTestServer, clearTestDB, addTestUser } from '../lib/testUtils.js';
import { User } from '../lib/models/user.model.js';

(async () => {
  // t.runOnly = true

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

  t.test('register a new user', async t => {
    t.equal(await User.countDocuments(), 0);
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
    t.equal(await User.countDocuments(), 1);
    t.type(res.payload, 'string')
    const parsedResponse = JSON.parse(res.payload);
    const token = parsedResponse.token;
    t.type(token, 'string');

    t.test('then auth with a valid token', async t => {
      t.equal(await User.countDocuments(), 1);
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

      t.test('then register another user with the same email', async t => {
        t.equal(await User.countDocuments(), 1)
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
        t.equal(await User.countDocuments(), 1)
        t.end();
      })
      t.end();
    })
    t.end();
  })

  t.test('register with missing details', async t => {
    const payloads = [
      {},
      {
        email: 'hello@hello.com',
        password: "password1"
      },
      {
        displayName: 'hello',
        password: "password1"
      },
      {
        displayName: 'hello',
        email: 'hello@hello.com',
      },
    ];
    for (const payload in payloads) {
      const res = await t.context.server.inject({
        method: 'post',
        url: '/api/auth/register',
        payload
      });
      t.equal(res.statusCode, 400);
    }
    t.end();
  })

  t.test('register with bad email', async t => {
    for (const email in ["hello", "hello@", "hello@goodbye", "@hello.com"]) {
      const res = await t.context.server.inject({
        method: 'post',
        url: '/api/auth/register',
        payload: {
          displayName: 'iHaveABadEmail',
          email: email,
          password: "password1"
        }
      });
      t.equal(res.statusCode, 400);
    }
    t.end();
  })

  t.test('auth without token', async t => {
    const res = await t.context.server.inject({
      method: 'get',
      url: '/api/auth/access-token'
    });
    t.equal(res.statusCode, 401);
    t.end();
  })

  t.test('auth with bad token', async t => {
    for (const tokenStr of ['Bearer aaaaaaaaaa', 'aaaaaaaaaa', '']) {
      const res = await t.context.server.inject({
        method: 'get',
        url: '/api/auth/access-token',
        headers: {
          'Authorization': tokenStr
        }
      });
      t.equal(res.statusCode, 401);
    }
    t.end();
  });

  t.test('auth with email/pass', async t => {
    await addTestUser(t.context, {
      displayName: 'tester1',
      email: 'tester1@blah.com',
      password: 'cheese'
    });

    const res = await t.context.server.inject({
      method: 'post',
      url: '/api/auth',
      payload: {
        email: 'tester1@blah.com',
        password: 'cheese'
      }
    });
    t.equal(res.statusCode, 200);
    const parsedResponse = JSON.parse(res.payload);
    t.equal(parsedResponse.user.data.displayName, 'tester1');
    t.end();
  });

  t.test('auth with email/pass, bad request', async t => {
    await addTestUser(t.context, {
      displayName: 'tester1',
      email: 'tester1@blah.com',
      password: 'cheese'
    });

    const payloads = [
      {},
      {
          password: 'cheese'
      },
      {
          email: 'tester1@blah.com'
      },
      {
          email: 'tester1@blah.com',
          password: ''
      }
    ];

    for (const payload of payloads) {
      const res = await t.context.server.inject({
        method: 'post',
        url: '/api/auth',
        payload: payload
      });
      t.equal(res.statusCode, 400);
    }
    t.end();
  });

  t.test('auth with email/pass, wrong credentials', async t => {
    await addTestUser(t.context, {
      displayName: 'tester1',
      email: 'tester1@blah.com',
      password: 'cheese'
    });

    const payloads = [
      {
          email: 'tester2@blah.com',
          password: 'cheese'
      },
      {
          email: 'tester1@blah.com',
          password: 'cheese1'
      },
      {
          email: 'tester1@blah.com',
          password: 'cheesecheese'
      },
      {
          email: 'tester1@blah.com',
          password: 'notcheese'
      }
    ];

    for (const payload of payloads) {
      const res = await t.context.server.inject({
        method: 'post',
        url: '/api/auth',
        payload: payload
      });
      t.equal(res.statusCode, 401);
    }
    t.end();
  });

  t.test('auth with email/pass, no user in db', async t => {
    const res = await t.context.server.inject({
      method: 'post',
      url: '/api/auth',
      payload: {
        email: 'abc@abc.net',
        password: 'agreatpassword'
      }
    });
    t.equal(res.statusCode, 401);
    t.end();
  });
})();
