import { MongoMemoryServer } from "mongodb-memory-server";
import { buildSimpleAPIServer } from "./services/simpleAPIServer";
import { buildDatabase } from "./services/database";

export function setupCg(context) {
  context.config = {
    'NODE_ENV': 'testing',
    'JWT_SECRET': 'blah',
    "PORT": 3001,
    "HTTP_SERVER_HOST": "localhost",
    "BCRYPT_SALT_ROUNDS": 10,
    "JWT_ALGORITH": "HS256"
  }
  context.cg = (key) => context.config[key];
}

export async function setupTestDB(context) {
  // console.log('Creating new mongo memory server')
  context.mongod = new MongoMemoryServer();
  context.config['DB_URI'] = await context.mongod.getConnectionString();
  context.db = await buildDatabase(context.cg)
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
