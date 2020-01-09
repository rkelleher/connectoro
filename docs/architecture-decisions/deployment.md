Google Cloud App Engine

Need to decide between 'standard' and 'flexible' (https://cloud.google.com/appengine/docs/the-appengine-environments#comparing_environments). Should probably start testing with standard as it doesn't charge while the app isn't being used.

 - https://cloud.google.com/appengine/docs/standard/nodejs/building-app/

## Using App Engine to serve our static assets (React frontend etc.)

In `server/app.template.yaml` we use a set of handlers to redirect most routes to just serve `index.html`, unless they are another static asset or for the API.
