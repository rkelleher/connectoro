const Hapi = require("@hapi/hapi");
const mongoose = require("mongoose");

const HTTP_SERVER_PORT = 3001;
const HTTP_SERVER_HOST = "localhost";
const MONGO_ADDRESS = "mongodb://localhost/connectoro";

const MONGO_CONNECTED_STR = "MongoDB connected";
const MONGO_DISCONNECT_STR = "MongoDB disconnected";
const MONGO_FORCED_DISCONNECT_STR =
  "MongoDB was disconnected due to app termination";

const UserSchema = new mongoose.Schema({
  email: {
    type: String
  },
  password: {
    type: String
  }
});

const User = mongoose.model("users", UserSchema);

const init = async () => {
  const server = Hapi.server({
    port: HTTP_SERVER_PORT,
    host: HTTP_SERVER_HOST,
    routes: {
      // TODO: CORs only in development
      cors: true
    }
  });

  server.app.db = mongoose.connect(MONGO_ADDRESS, {
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

  // Create a new user
  server.route({
    method: "POST",
    path: "/api/auth/register",
    handler: (request, h) => {
      console.log("request:", request);
      return {error: "Not implemented"};
    }
  });

  // Login with email and password
  server.route({
    method: "GET",
    path: "/api/auth",
    handler: (request, h) => {
      console.log("request:", request);
      return {error: "Not implemented"};
    }
  });

  // Login with JWT token
  server.route({
    method: "GET",
    path: "/api/auth/access-token",
    handler: (request, h) => {
      console.log("request:", request);
      return {error: "Not implemented"};
    }
  });

  // Update user details
  server.route({
    method: "POST",
    path: "/api/auth/user/update",
    handler: (request, h) => {
      console.log("request:", request);
      return {error: "Not implemented"};
    }
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", error => {
  console.log(error);

  mongoose.connection && mongoose.connection.close(() => {
    console.log(MONGO_FORCED_DISCONNECT_STR);
    process.exit(1);
  });
});

init();
