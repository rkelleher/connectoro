import mongoose from "mongoose";

const MONGO_ADDRESS = "mongodb://localhost/connectoro";

const MONGO_CONNECTED_STR = "MongoDB connected";
const MONGO_DISCONNECT_STR = "MongoDB disconnected";
const MONGO_FORCED_DISCONNECT_STR =
  "MongoDB was disconnected due to app termination";

export async function buildDatabase() {

  const db = mongoose.connect(MONGO_ADDRESS, {
    useNewUrlParser: true,
    useUnifiedTopology: true
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
    console.log(error);

    connection &&
      connection.close(() => {
        console.log(MONGO_FORCED_DISCONNECT_STR);
        process.exit(1);
      });
  });

  return db;
}