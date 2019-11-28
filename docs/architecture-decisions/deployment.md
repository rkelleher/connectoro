Google Cloud App Engine

Need to decide between 'standard' and 'flexible' (https://cloud.google.com/appengine/docs/the-appengine-environments#comparing_environments). Should probably start testing with standard as it doesn't charge while the app isn't being used?

 - https://cloud.google.com/appengine/docs/standard/nodejs/building-app/

Do we want to use App Engine to serve our static assets (React frontend etc.)?

We could define a default handler to redirect everything to just serve `index.html` in [app.yaml](https://cloud.google.com/appengine/docs/standard/nodejs/config/appref), then setup [dispatch.yaml](https://cloud.google.com/appengine/docs/standard/nodejs/reference/dispatch-yaml) to send requests to, say, `/api/*` to our node app?
