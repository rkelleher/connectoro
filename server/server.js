import { buildDatabase } from './lib/services/database.js';
import { buildSimpleAPIServer } from './lib/services/simpleAPIServer.js';
import config from 'nconf';

(async () => {
  // config is added in order of priority, highest to lowest
  config.argv().env()

  // helper fn for reading config, to be passed throughout the app
  // to keep config vals transparent we shouldn't use config.set etc. outside of this file
  const cg = (key) => config.get(key);

  if (cg('NODE_ENV') === 'production') {
    config.file('prod', 'prod.env.json')

  } else {
    config
      .file('secrets', 'secrets/secret.dev.env.json')
      .file('dev', 'dev.env.json')
  }

  const db = await buildDatabase(cg);
  const apiServer = await buildSimpleAPIServer(cg, db);

  await apiServer.start();

  console.log("Server running on %s", apiServer.info.uri);
})()
