## Encrypting sensitive user data in MongoDB
We could use [mongoose-encryption](https://github.com/joegoldbeck/mongoose-encryption) but that would tie us to mongoose and would need vetting. A simpler, more flexible solution is to use the tried-and-tested [node.bcrypt.js](https://github.com/kelektiv/node.bcrypt.js).

 - Which user fields should we encrypt?
  - Let's start with just password
 - How many saltRounds? (tradeoff between resources spent / user wait & security)
  - Let's start with 10, the node.bcrypt default  

## Client web app authentication
Given the Fuse template already supports JSON Web Tokens, that seems to be our easiest path forward.

 - How do we securely manage our secret key? (**using it, an attacker can impersonate any user**)
 - Where should we store the tokens on the client?
  - The Fuse template stores them in localstorage but this is vulnerable to [XSS](https://www.wikiwand.com/en/Cross-site_scripting)
  - We should probably store the tokens in an HttpOnly cookie
 - How long until they should expire?
  - This is a tradeoff between user-flow and security. For security we want this to be as short as possible, but then users would need to log in again when it expires. We can offset this somewhat by renewing the token regularly.

 JSON Web tokens allows us to use stateless authentication: each request contains its own authorization, we don't have to check with the database each time. We avoid [CSRF](https://es.wikipedia.org/wiki/Cross-site_request_forgery) vulnerabilities, as there are no sessions.

 An important drawback is outlined [here](https://security.stackexchange.com/questions/49145/avoid-hitting-db-to-authenticate-a-user-on-every-request-in-stateless-web-app-ar): "If a user clicks logout, the cookie is cleared from their browser. However, if an attacker has captured the cookie, they can continue to use it until the cookie expires.".

 Some ideas for further security:
  - https://solidgeargroup.com/refresh-token-with-jwt-authentication-node-js
  - https://security.stackexchange.com/questions/49145/avoid-hitting-db-to-authenticate-a-user-on-every-request-in-stateless-web-app-ar
