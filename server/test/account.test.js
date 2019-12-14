import t from 'tap';
import { setupAPITest, setupTester1 } from '../lib/testUtils.js';
import { Account, INTEGRATION_TYPES } from '../lib/models/account.model.js';

(async () => {
  await setupAPITest(t);

  t.test('linked account created with admin user registration', async t => {
    t.equal(await Account.countDocuments(), 0);
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
    t.type(res.payload, 'string')
    const { user } = JSON.parse(res.payload);
    t.equal(await Account.countDocuments(), 1);
    const account = await Account.findOne();
    t.equal(account.email, 'abc@abc.abc')
    t.equal(account.users[0].toHexString(), user.id);
    t.equal(user.accountId, account.id);
  })

  t.test('get account details of an admin user', async t => {
    const userEmail = 'test33@test.test';
    const { user, token } = await setupTester1(t.context, {
      email: userEmail
    });
    const res = await t.context.server.inject({
      method: 'get',
      url: `/api/account`,
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    t.equal(res.statusCode, 200);
    t.type(res.payload, 'string')
    const parsedPayload = JSON.parse(res.payload);
    const { email, users, integrations } = parsedPayload;
    t.equal(email, userEmail);
    t.equal(users[0], user.id);
    t.equal(users.length, 1)
    t.equal(integrations.length, 0)
  });

  t.test('add an integration', async t => {
    const { token, account } = await setupTester1(t.context);
    t.equal(account.integrations.length, 0);
    const res = await t.context.server.inject({
      method: 'post',
      url: `/api/account/integration`,
      headers: {
        'Authorization': 'Bearer ' + token
      },
      payload: {
        type: 'LINNW'
      }
    });
    t.equal(res.statusCode, 200);
    t.type(res.payload, 'string')
    const parsedPayload = JSON.parse(res.payload);
    const { integrations } = parsedPayload;
    t.equal(integrations.length, 1);
    t.equal(integrations[0].integrationType, 'LINNW');
    const newAccount = await Account.findById(account.id);
    t.equal(newAccount.integrations.length, 1);
  });

  t.test('delete an integration', async t => {
    const { token } = await setupTester1(t.context);
    const res1 = await t.context.server.inject({
      method: 'post',
      url: `/api/account/integration`,
      headers: {
        'Authorization': 'Bearer ' + token
      },
      payload: {
        type: INTEGRATION_TYPES[0]
      }
    });
    t.equal(res1.statusCode, 200);
    const res2 = await t.context.server.inject({
      method: 'post',
      url: `/api/account/integration`,
      headers: {
        'Authorization': 'Bearer ' + token
      },
      payload: {
        type: INTEGRATION_TYPES[1]
      }
    });
    t.equal(res2.statusCode, 200);
    const { integrations } = JSON.parse(res2.payload);
    t.equal(integrations.length, 2);
    const integrationToRemove = integrations[0];
    const res3 = await t.context.server.inject({
      method: 'delete',
      url: `/api/account/integration`,
      headers: {
        'Authorization': 'Bearer ' + token
      },
      payload: {
        id: integrationToRemove._id
      }
    });
    t.equal(res3.statusCode, 200);
    const integrations2 = JSON.parse(res3.payload).integrations;
    t.equal(integrations2.length, 1);
    t.notEqual(integrations2[0]._id, integrationToRemove._id);
  });

  t.test('update integration options')
  t.test('update integration credentials')

})()
