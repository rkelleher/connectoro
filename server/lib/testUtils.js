import MongoMemoryServer from "mongodb-memory-server";
import { buildSimpleAPIServer } from "./simpleAPIServer.js";
import { buildDatabase } from "./services/database.js";
import bcrypt from 'bcrypt';
import { User } from "./models/user.model.js";
import { Account } from "./models/account.model.js";
import { createUserToken } from "./auth.js";
import { addIntegration } from "./controllers/account.controller.js";

export function setupCg(context, opts = {}) {
  context.config = Object.assign({
    'NODE_ENV': 'testing',
    'JWT_SECRET': 'blah',
    "PORT": 3001,
    "HTTP_SERVER_HOST": "localhost",
    "BCRYPT_SALT_ROUNDS": 10,
    "JWT_ALGORITH": "HS256",
    "LOGIN_EXPIRES_IN": "1d"
  }, opts);
  context.cg = (key) => {
    const val = context.config[key]
    // console.log(key, val)
    return val;
  };
}

export async function setupTestDB(context) {
  // console.log('Creating new mongo memory server')
  // TODO fix this,
  // looks like node-tap resolves modules incorrectly?
  if (MongoMemoryServer.MongoMemoryServer) {
    context.mongod = new MongoMemoryServer.MongoMemoryServer();
  } else {
    context.mongod = new MongoMemoryServer();
  }
  const uri = await context.mongod.getConnectionString();
  context.db = await buildDatabase(context.cg, {uri})
}

export async function teardownTestDB(context) {
  // console.log('Tearing down mongo memory server')
  await context.mongod.stop();
  await context.db.connection.dropDatabase();
  await context.db.connection.close();
}

export async function clearTestDB(context) {
  // console.log('Clearing DB')
  const collections = context.db.connection.collections;

  for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
  }
}

export async function setupTestServer(context) {
  // console.log('Setting up test server')
  context.server = await buildSimpleAPIServer(context.cg, context.db);
}

export async function initializeTestServer(context) {
  // console.log('Initializing test server')
  return context.server.initialize();
}

export async function stopTestServer(context) {
  // console.log('Stopping test server')
  return context.server.stop();
}

export async function addTestAdminUser(context, userDetails) {
  const { displayName, email, password } = userDetails;
  const passwordHash = await bcrypt.hash(password, context.cg('BCRYPT_SALT_ROUNDS'));
  const user = new User({
    displayName,
    email,
    passwordHash,
    role: 'admin'
  });
  await user.save();
  return user;
}

export async function addTestAccount(context, accountDetails) {
  const { email, users, integrations } = accountDetails;
  const account = new Account({
    email,
    users,
    integrations
  });
  await account.save();
  return account;
}

export function createTestUserToken(context, userId) {
  return createUserToken(context.cg, userId);
}

export async function addTestIntegration(context, account, integrationType) {
  await addIntegration(account, integrationType);
  const integrations = account.integrations.toObject();
  const id = integrations[integrations.length - 1]._id;
  return { id };
}

export async function setupTester1(context, {
  displayName = 'testuser1',
  email = 'testuser1@test.test',
  password = 'password1'
} = {}) {
  const user = await addTestAdminUser(context, {
    displayName,
    email,
    password,
  });
  const token = createTestUserToken(context, user.id);
  const account = await addTestAccount(context, {
    email,
    users: [user.id],
    integrations: []
  });
  user.account = account.id;
  await user.save();
  return {
    user,
    token,
    account
  };
}

export async function setupAPITest(t) {
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
  return t;
}
