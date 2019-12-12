import { MongoMemoryServer } from "mongodb-memory-server";
import { buildSimpleAPIServer } from "./services/simpleAPIServer";
import { buildDatabase } from "./services/database";
import bcrypt from 'bcrypt';
import { User } from "./models/user.model";

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
  context.mongod = new MongoMemoryServer();
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
