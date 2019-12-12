import Hapi from '@hapi/hapi';
import Joi from '@hapi/joi';
import Boom from '@hapi/boom';
import Hoek from '@hapi/hoek';
const { assert } = Hoek;
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import hapiJWT from "hapi-auth-jwt2";
import mongoose from 'mongoose';

import {
  getUserDetails,
  getUserDetailsById,
  findUserByEmail,
  createNewAdminUser,
  removeUserByID,
  findUserById
} from '../controllers/user.controller.js';
import {
  createNewLinkedAccount
} from "../controllers/account.controller.js";

const ERR_NO_USER_WITH_EMAIL = 'ERR_NO_USER_WITH_EMAIL';
const ERR_EMAIL_TAKEN = 'ERR_EMAIL_TAKEN';
const ERR_WRONG_PASSWORD = 'ERR_WRONG_PASSWORD'

function createUserToken(cg, userId) {
  return jwt.sign(
    {sub: userId},
    cg('JWT_SECRET'),
    {
      algorithm: cg('JWT_ALGORITH'),
      expiresIn: cg('LOGIN_EXPIRES_IN')
    }
  );
}

async function validateToken(decoded, request, h) {
  const userId = decoded.sub;
  const user = findUserById(userId);
  if (user) {
    request.headers.authenticatedUserId = userId;
    return {isValid: true};
  } else {
    return {isValid: false}
  }
};

export async function buildSimpleAPIServer(cg, db) {
  assert(cg && db, 'Missing params');

  const server = Hapi.server({
    port: cg('PORT'),
    host: cg('HTTP_SERVER_HOST'),
    routes: {
      cors: cg('NODE_ENV') === 'development'
    }
  });

  server.app.db = db;

  await server.register(hapiJWT);

  const JWT_SECRET = cg('JWT_SECRET');

  assert(JWT_SECRET, 'Missing JWT secret');

  server.auth.strategy("jwt", "jwt", {
    key: JWT_SECRET,
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
      
      if (await findUserByEmail(email)) {
        return Boom.badRequest(ERR_EMAIL_TAKEN);
      }

      const passwordHash = await bcrypt.hash(password, cg('BCRYPT_SALT_ROUNDS'));

      let user;

      try {
        user = await createNewAdminUser({
          displayName,
          email,
          passwordHash
        });
      } catch(e) {
        if (e instanceof mongoose.Error.ValidationError) {
          return Boom.badRequest()
        } else {
          throw e;
        }
      }

      // user was created successfully, now create and link an account 
      // TODO can this be done more transaction-like?
      try {
        await createNewLinkedAccount(user);
      } catch (e) {
        console.log('Error creating linked account, deleting admin user...')
        await removeUserByID(user.id);
        throw e;
      }

      const token = createUserToken(cg, user.id);
      const userDetails = getUserDetails(user);

      return {
        token,
        user: userDetails
      };
    },
    options: {
      auth: false,
      validate: {
        payload: Joi.object({
          displayName: Joi.string().min(2).required(),
          email: Joi.string().required(),
          password: Joi.string().min(6).required(),
        })
      }
    }
  });

  // Login with email and password
  server.route({
    method: "POST",
    path: "/api/auth",
    handler: async (request, h) => {
      const {email, password} = request.payload;

      const user = await findUserByEmail(email);

      if (!user) {
        throw Boom.unauthorized(ERR_NO_USER_WITH_EMAIL);
      }

      const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

      if (!passwordsMatch) {
        throw Boom.unauthorized(ERR_WRONG_PASSWORD);
      }

      const token = createUserToken(cg, user.id);
      const userDetails = getUserDetails(user);

      return {
        token,
        user: userDetails
      };
    },
    options: {
      auth: false,
      validate: {
        payload: Joi.object({
          email: Joi.string().required(),
          password: Joi.string().required()
        })
      }
    }
  });

  // Login with and renew JWT token
  server.route({
    method: "GET",
    path: "/api/auth/access-token",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;
      const user = await getUserDetailsById(userId);
      // give the user a fresh token
      const token = createUserToken(cg, userId);
      return {user, token};
    }
  });

  // Update user details
  server.route({
    method: "POST",
    path: "/api/auth/user/update",
    handler: async (request, h) => {
      // TODO save user updates
      throw new Boom.notImplemented();
    }
  });

  return server;
}
