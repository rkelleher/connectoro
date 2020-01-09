# connectoro

E-commerce management system on steroids!

## Setting up a developer environment

Local dependencies:
 - node 12
 - yarn 1.19
 - MongoDB 4.2

Start mongo and create a new database called `connectoro`. 

In `/client`, duplicate the `.env.example` file and name it `.env`.

In `/server/secrets`, duplicate the `secret.dev.env.template.json` file and name it `secret.dev.env.json`. You'll need to insert any values labeled `<INSERT HERE>`.

Inside `/server` run `yarn start:dev` to start the backend server.

Inside `/client` run `yarn start` to build and serve the frontend web app.

A new browser window should open and you'll see a security warning. This is because react-scripts is serving the app over https with a self-signed certificate (only in dev mode). You can safely ignore the warning and click through to the app.

## Deploying to production

Local dependencies:
  - Google Cloud SDK (https://cloud.google.com/sdk/)

Run `gcloud auth login` then `./deploy.sh`

## Running server tests

Inside `/server` run `yarn test`.
