const Hapi = require("@hapi/hapi");
const Joi = require("@hapi/joi")

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const hapiJWT = require("hapi-auth-jwt2");

const mongoose = require("mongoose");

const ERR_NO_USER_WITH_EMAIL = 'ERR_NO_USER_WITH_EMAIL';
const ERR_EMAIL_TAKEN = 'ERR_EMAIL_TAKEN';
const ERR_WRONG_PASSWORD = 'ERR_WRONG_PASSWORD'

const BCRYPT_SALT_ROUNDS = 10;

// this key is a single point of security failure
// see: docs/architecture-decisions/security.md
// TODO confirm that we are in a production environment
//      if JWT_SECRET env variable is not set correctly,
//      we could accidentally deploy with the dev default secret
const JWT_SECRET = process.env.JWT_SECRET || "secretsandlies";

const JWT_ALGORITH = 'HS256';

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

function getUserDetails(user) {
  return {
    role: "admin",
    data: {
      'displayName': user.displayName,
      'photoURL'   : 'assets/images/avatars/Abbott.jpg',
      'email'      : user.email,
      settings     : {
        layout          : {
          style : 'layout1',
          config: {
            scroll : 'content',
            navbar : {
              display : true,
              folded  : true,
              position: 'left'
            },
            toolbar: {
              display : true,
              style   : 'fixed',
              position: 'below'
            },
            footer : {
              display : true,
              style   : 'fixed',
              position: 'below'
            },
            mode   : 'fullwidth'
          }
        },
        customScrollbars: true,
        theme           : {
          main   : 'defaultDark',
          navbar : 'defaultDark',
          toolbar: 'defaultDark',
          footer : 'defaultDark'
        }
      },
      shortcuts    : [
        'calendar',
        'mail',
        'contacts'
      ]
    }
  }
}

async function getUserDetailsById(id) {
  // TODO use select() to fetch less data
  const user = await User.findById(id);
  return getUserDetails(user);
}

// TODO expire token
function createToken(userId) {
  return jwt.sign(
    {sub: userId},
    JWT_SECRET,
    {algorithm: JWT_ALGORITH}
  );
}

// TODO what kind of additional verification can we do?
async function validateToken(decoded, request, h) {
  const userId = decoded.sub;
  const user = await User.findById(userId);
  if (user) {
    request.headers.authenticatedUserId = userId;
    return {isValid: true};
  } else {
    return {isValid: false}
  }
};

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

  server.auth.strategy("jwt", "jwt", {
    key: JWT_SECRET,
    validate: validateToken,
    verifyOptions: {algorithms: [JWT_ALGORITH]},
    tokenType: "Bearer"
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
        return {errorCode: ERR_EMAIL_TAKEN}
      }

      const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)

      const user = new User({
        displayName,
        email,
        passwordHash
      });

      await user.save();

      const token = createToken(user.id);
      const userDetails = getUserDetails(user);

      return {
        token,
        user: userDetails
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

      const token = createToken(user.id);
      const userDetails = getUserDetails(user);

      return {
        token,
        user: userDetails
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
      const userId = request.headers.authenticatedUserId;
      const user = await getUserDetailsById(userId);
      // give the user a fresh token
      const token = createToken(userId);
      return {user, token};
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
