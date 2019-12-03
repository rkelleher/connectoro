# connectoro

E-commerce management system on steroids!

## Setting up a developer environment

You'll need to install the following:
 - node (version 12)
 - yarn (TODO fixed version)
 - MongoDB (TODO fixed version)

Start mongo and create a new database called `connectoro`. 

In `/client`, duplicate the `.env.example` file and name it `.env`.

In `/server/secrets`, duplicate the `secret.dev.env.template.json` file and name it `secret.dev.env.json`. You'll need to insert any values labeled `<INSERT HERE>`.

Inside `/server` run `yarn start:dev` to start the backend server.

Inside `/client` run `yarn start` to build and serve the frontend web app.

A new browser window should open and you'll see a security warning. This is because react-scripts is serving the app over https with a self-signed certificate (only in dev mode). You can safely ignore the warning and click through to the app.