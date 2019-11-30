const Hapi = require("@hapi/hapi");
const Joi = require("@hapi/joi")

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const hapiJWT = require("hapi-auth-jwt2");

const mongoose = require("mongoose");

const EMAIL_TAKEN_ERROR_CODE = 'ERR_EMAIL_TAKEN';

const BCRYPT_SALT_ROUNDS = 10;

// this key is a single point of security failure
// see: docs/architecture-decisions/security.md
// TODO confirm that we are in a production environment
//      if JWT_SECRET env variable is not set correctly,
//      we could accidentally deploy with the dev default secret
const JWT_SECRET = process.env.JWT_SECRET || "secretsandlies";

//TODO use process.env.PORT on App Engine
const HTTP_SERVER_PORT = 3001;

//TODO use 0.0.0.0 on App Engine
const HTTP_SERVER_HOST = "localhost";

const MONGO_ADDRESS = "mongodb://localhost/connectoro";

const MONGO_CONNECTED_STR = "MongoDB connected";
const MONGO_DISCONNECT_STR = "MongoDB disconnected";
const MONGO_FORCED_DISCONNECT_STR =
  "MongoDB was disconnected due to app termination";

const UserSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("users", UserSchema);

const init = async () => {
  const server = Hapi.server({
    port: HTTP_SERVER_PORT,
    host: HTTP_SERVER_HOST,
    routes: {
      // TODO: CORs only in development
      cors: false
    }
  });

  await server.register(hapiJWT);

  const validateWebToken = async function(decoded, request, h) {
    const tokenIsValid = false;
    return {isValid: tokenIsValid};
  };

  server.auth.strategy("jwt", "jwt", {
    key: JWT_SECRET,
    validate: validateWebToken,
    verifyOptions: {algorithms: ["HS256"]}
  });

  server.auth.default("jwt");

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
    handler: async (request, h) => {
      const {displayName, email, password} = request.payload;
      
      if (await User.findOne({email})) {
        return {errorCode: EMAIL_TAKEN_ERROR_CODE}
      }

      const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)

      const user = new User({
        displayName,
        email,
        passwordHash
      });

      await user.save();

      // TODO expire token
      // TODO into shared fn
      const token = jwt.sign(
        { sub: user.id },
        JWT_SECRET,
        {algorithm: 'HS256'}
      );

      return {
        token,
        user: {
          displayName: user.displayName,
          email: user.email
        }
      };
    },
    options: {
      auth: false
    }
  });

  // Login with email and password
  server.route({
    method: "POST",
    path: "/api/auth",
    handler: async (request, h) => {
      // TODO catch failure to destructure (no payload etc.)
      const {email, password} = request.payload;

      const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
      const user = await User.findOne({email});

      if (!user) {
        return {
          errorCode: ERR_NO_USER_WITH_EMAIL
        }
      }

      if (!bcrypt.compare(passwordHash, user.passwordHash)) {
        return {
          errorCode: ERR_WRONG_PASSWORD
        }
      }

      // TODO expire token
      // TODO into shared fn
      const token = jwt.sign(
        { sub: user.id },
        JWT_SECRET,
        {algorithm: 'HS256'}
      );

      return {
        token,
        user: {
          displayName: user.displayName,
          email: user.email
        }
      };
    },
    options: {
      auth: false
    }
  });

  // Login with JWT token
  server.route({
    method: "GET",
    path: "/api/auth/access-token",
    handler: async (request, h) => {
      // give them their db user (-hash)
      return {error: "Not implemented"};
    }
  });

  // Update user details
  server.route({
    method: "POST",
    path: "/api/auth/user/update",
    handler: async (request, h) => {
      // TODO update user details
      return {error: "Not implemented"};
    }
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", error => {
  console.log(error);

  mongoose.connection &&
    mongoose.connection.close(() => {
      console.log(MONGO_FORCED_DISCONNECT_STR);
      process.exit(1);
    });
});

init();
