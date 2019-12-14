import jwt from 'jsonwebtoken';

export function createUserToken(cg, userId) {
  const secret = cg('JWT_SECRET');
  const algorithm = cg('JWT_ALGORITH');
  const expiresIn = cg('LOGIN_EXPIRES_IN');
  return jwt.sign(
    {sub: userId},
    secret,
    { algorithm, expiresIn }
  );
}

export async function validateToken(decoded, request, h) {
  const userId = decoded.sub;
  if (userId) {
    request.headers.authenticatedUserId = userId;
    return {isValid: true};
  } else {
    return {isValid: false}
  }
};
