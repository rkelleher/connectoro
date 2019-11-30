# connectoro

E-commerce management system on steroids!

## Setting up a developer environment

You'll need to install the following:
 - node (version 12)
 - yarn (TODO fixed version)
 - MongoDB (TODO fixed version)

Start mongo and create a new database called `connectoro`. 

Navigate to `/server` and run `yarn start:dev` to start the Node server.

Navigate to `/client` and run `yarn start` to build and serve the web app.

A new browser window should open and you'll see a security warning. This is because react-scripts is serving the app over https with a self-signed certificate (only in dev mode). You can safely ignore the warning and click through to the app.