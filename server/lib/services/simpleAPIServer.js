import Hapi from "@hapi/hapi";
import Joi from "@hapi/joi";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import hapiJWT from "hapi-auth-jwt2";

import { User } from '../models/user.model.js';
import { getUserDetails } from '../controllers/user.controller.js';

const ERR_NO_USER_WITH_EMAIL = 'ERR_NO_USER_WITH_EMAIL';
const ERR_EMAIL_TAKEN = 'ERR_EMAIL_TAKEN';
const ERR_WRONG_PASSWORD = 'ERR_WRONG_PASSWORD'


function createToken(cg, userId) {
  return jwt.sign(
    {sub: userId},
    cg('JWT_SECRET'),
    {
      algorithm: cg('JWT_ALGORITH'),
      expiresIn: '1d' // 1 day
    }
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

export async function buildSimpleAPIServer(cg, db) {

  if (!db) {
    throw new Error('No database object')
  }

  if (!cg('JWT_SECRET')) {
    throw new Error('JWT Secret has not been set correctly')
  }

  const server = Hapi.server({
    port: cg('PORT'),
    host: cg('HTTP_SERVER_HOST'),
    routes: {
      cors: process.env.NODE_ENV === 'development'
    }
  });

  server.app.db = db;

  await server.register(hapiJWT);

  server.auth.strategy("jwt", "jwt", {
    key: cg('JWT_SECRET'),
    validate: validateToken,
    verifyOptions: {algorithms: [cg('JWT_ALGORITH')]},
    tokenType: "Bearer"
  });

  server.auth.default("jwt");

  // Create a new user
  server.route({
    method: "POST",
    path: "/api/auth/register",
    handler: async (request, h) => {
      const {displayName, email, password} = request.payload;
      
      if (await User.findOne({email})) {
        return {errorCode: ERR_EMAIL_TAKEN}
      }

      const passwordHash = await bcrypt.hash(password, cg('BCRYPT_SALT_ROUNDS'));

      const user = new User({
        displayName,
        email,
        passwordHash
      });

      await user.save();

      const token = createToken(cg, user.id);
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

      const token = createToken(cg, user.id);
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
      const token = createToken(cg, userId);
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

  return server;
}
