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

## Server app secrets
Here's is what Google suggests: https://cloud.google.com/kms/docs/secret-management#choosing_a_secret_management_solution
 - Storing secrets in code, encrypted with a key from KMS
 - Storing secrets in a storage bucket in Cloud Storage, encrypted at rest
 - Using a third-party secret management solution

Google App Engine only provides one method for setting env variables in the standard node environment: adding them to `app.yaml` under `env_variables`. This is a problem as we want to be able to check `app.yaml` into version control. Here are some workarounds I've been able to find:

 - https://dev.to/mungell/google-cloud-app-engine-environment-variables-5990
   - using a template library to rewrite `app.yaml` on the build server (Gitlab CI)
   - CON: need to use a build server
 - https://www.dontpanicblog.co.uk/2019/04/27/secrets-in-google-app-engine/
   - injecting env variables at build time with Travis CI
   - CON: need to use a build server
 - https://medium.com/@gunar/how-to-use-environment-variables-in-gcloud-app-engine-node-js-86623b3ab0f6
   - storing the secrets (encrypted) in cloud storage then fetching them a runtime
   - this no longer works as described (can't write to the filesytem except /tmp anymore) but the idea could still work
   - CON: extra runtime code complexity
 - https://medium.com/@brian.young.pro/how-to-add-environmental-variables-to-google-app-engine-node-js-using-cloud-build-5ce31ee63d7
   - storing secrets in Build Triggers in Google Cloud Build
   - CON: need to setup/maintain a Cloud Build, can't just use standard deploy

Another Option:
 - store the secrets encrypted in the repo (probably using Google KMS) and rewrite `app.yaml` locally as part of deploy script
   - CON: limited access control

Some secret management tools:
 - https://github.com/GoogleCloudPlatform/berglas
   - doesn't work with 'standard' app engine, only 'flex'
 - https://www.vaultproject.io/