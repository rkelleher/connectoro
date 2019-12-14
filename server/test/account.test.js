import t from 'tap';
import { setupAPITest, addTestAccount, addTestAdminUser, createTestUserToken } from '../lib/testUtils.js';
import { Account } from '../lib/models/account.model.js';

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

  t.test('get account details by id', async t => {
    const userEmail = 'test33@test.test';
    const user = await addTestAdminUser(t.context, {
      displayName: 'tester',
      email: userEmail,
      password: 'password2'
    });
    const account = await addTestAccount(t.context, {
      email: userEmail,
      users: [user.id],
      integrations: []
    });
    user.account = account.id;
    await user.save();
    const token = createTestUserToken(t.context, user.id);
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

})()
