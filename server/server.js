import { buildDatabase } from './lib/services/database.js';
import { buildSimpleAPIServer } from './lib/services/simpleAPIServer.js';

(async () => {
  const db = await buildDatabase();
  const apiServer = await buildSimpleAPIServer(db);

  await apiServer.start();

  console.log("Server running on %s", apiServer.info.uri);
})()
