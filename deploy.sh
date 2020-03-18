#!/usr/bin/sh
cd client/
yarn build
cd ..

rm -r server/static
cp -r client/build server/static

node inject-secrets.js

cd server
echo "Deploying app with --no-promote for testing"
gcloud app deploy --no-promote
#rm app.yaml
cd ..
echo "Done!"
