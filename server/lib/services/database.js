import mongoose from "mongoose";

const MONGO_CONNECTING_STR = "Connecting to MongoDB...";
const MONGO_CONNECTED_STR = "MongoDB connected";
const MONGO_DISCONNECT_STR = "MongoDB disconnected";
const MONGO_FORCED_DISCONNECT_STR =
  "MongoDB was disconnected due to app termination";

function buildURI(cg) {
  const name = cg('DB_NAME');

  if (cg('NODE_ENV') === 'production') {
    const user = cg('DB_USERNAME');
    const pass = cg('DB_PASSWORD');
    const host = cg('DB_HOST')
    const port = cg('DB_PORT');
    return `mongodb://${user}:${pass}@${host}:${port}/${name}`;
  } else if (cg('NODE_ENV') === 'development') {
    return `mongodb://localhost/${name}`;
  } else if (cg('NODE_ENV') == 'testing') {
    return cg('DB_URI');
  }
}

export async function buildDatabase(cg) {
  console.log(MONGO_CONNECTING_STR);

  const db = mongoose.connect(buildURI(cg), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // TODO this is the suggested config for testing w/ mongod-memory-server
    //      but I haven't run into any issues so far
    // autoReconnect: true,
    // reconnectTries: Number.MAX_VALUE,
    // reconnectInterval: 1000
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

    connection &&
      connection.close(() => {
        console.log(MONGO_FORCED_DISCONNECT_STR);
        process.exit(1);
      });
  });

  return db;
}
