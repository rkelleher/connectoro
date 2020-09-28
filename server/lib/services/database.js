import mongoose from "mongoose";

export const DBValidationError =  mongoose.Error.ValidationError;

const MONGO_CONNECTING_STR = "Connecting to MongoDB:";
const MONGO_CONNECTED_STR = "MongoDB connected";
const MONGO_DISCONNECT_STR = "MongoDB disconnected";
const MONGO_FORCED_DISCONNECT_STR =
  "MongoDB was disconnected due to app termination";

function buildURI(cg) {
  const env = cg('NODE_ENV');
  const name = cg('DB_NAME');

  if (!name) {
    throw new Error('DB_NAME has not been set.');
  }

  if (env === 'production') {
    const user = cg('DB_USERNAME');
    const pass = cg('DB_PASSWORD');
    const host = cg('DB_HOST');
    const params = cg('DB_PARAM_STR');
    return `mongodb+srv://${user}:${pass}@${host}/${name}${params}`;
  } else if (env === 'development') {
    return 'mongodb://localhost:27017/test1';
  }
}

export async function buildDatabase(cg, opts = {}) {
  const uri = opts.uri || buildURI(cg);

  mongoose.set('debug', cg('DEBUG_MONGOOSE'));

  console.log(MONGO_CONNECTING_STR, uri);

  const db = mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoReconnect: true,
    // reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000
  });

  mongoose.connection.on("connected", () => {
    console.log(MONGO_CONNECTED_STR);
  });

  mongoose.connection.on("disconnected", () => {
    console.log(MONGO_DISCONNECT_STR);
  });

  process.on("SIGINT", () => {
    mongoose.connection.close(() => {
      console.log(MONGO_FORCED_DISCONNECT_STR);
      process.exit(0);
    });
  });

  process.on("unhandledRejection", error => {
    console.error(error);

    if (mongoose.connection)
      mongoose.connection.close(() => {
        console.log(MONGO_FORCED_DISCONNECT_STR);
        process.exit(1);
      });
  });

  return db;
}
