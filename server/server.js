import config from 'nconf';
import Mongo from 'mongodb';

import { buildDatabase } from './lib/services/database.js';
import { buildSimpleAPIServer } from './lib/simpleAPIServer.js';
import ServiceOrderChecker from './lib/crons/requestIdChecker.cron.js';
import { cronFetchFromLinworks } from './lib/crons/pull-linnworks.cron.js';
import { TrackingStatusCron } from './lib/crons/tracking-status.cron.js';
import { TrackingUpdateStatusCron } from './lib/crons/tracking-status-update.cron.js';

(async () => {
  // config is added in order of priority, highest to lowest
  config.argv().env();

  // helper fn for reading config, to be passed throughout the app
  // to keep config vals transparent we shouldn't use config.set etc. outside of this file
  const cg = (key) => config.get(key);

  if (!cg('NODE_ENV')) {
    throw new Error('NODE_ENV has not been set');
  }

  if (cg('NODE_ENV') === 'production') {
    config.file('prod', 'prod.env.json');

  } else {
    config
      .file('secrets', 'secrets/secret.dev.env.json')
      .file('dev', 'dev.env.json');
  }


  global.dbConnection = await Mongo.MongoClient.connect(
    'mongodb+srv://testserver:OQT9ZXW20jIszyaT@cluster0-nbzw1.gcp.mongodb.net/test1',
    { useNewUrlParser: true, useUnifiedTopology: true }
  );

  const db = await buildDatabase(cg);
  const apiServer = await buildSimpleAPIServer(cg, db);

  await apiServer.start();
  await ServiceOrderChecker(cg).start();
  await cronFetchFromLinworks(cg).start();
  await TrackingStatusCron(cg).start();
  await TrackingUpdateStatusCron(cg).start();

  console.log("Connectoro API Server running on %s", apiServer.info.uri);
})()
