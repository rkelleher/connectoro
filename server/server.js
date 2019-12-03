import { buildDatabase } from './lib/services/database.js';
import { buildSimpleAPIServer } from './lib/services/simpleAPIServer.js';
import config from 'nconf';

(async () => {
  // config added in order of priority, highest to lowest
  config
    .argv()
    .env()
    .file('secrets', 'secret.env.json')
    .file('defaults', 'default.env.json')

  // helper fn for reading config, to be passed throughout the app
  // to keep config vals transparent we shouldn't use config.set outside of this file
  const cg = (key) => config.get(key);

  // TODO move once prod config on App Engine is sorted
  if (cg('NODE_ENV') === 'production') {
    config.set('HTTP_SERVER_HOST', '0.0.0.0');
  } else {
    config.set('JWT_SECRET', 'secretsandlies');
  }

  const db = await buildDatabase(cg);
  const apiServer = await buildSimpleAPIServer(cg, db);

  await apiServer.start();

  console.log("Server running on %s", apiServer.info.uri);
})()
