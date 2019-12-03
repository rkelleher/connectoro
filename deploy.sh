#!/usr/bin/sh
cd client
yarn build
cd ..

rm -r server/static
cp -r client/build server/static

node inject-secrets.js

cd server
# gcloud app deploy
# rm app.yaml
cd ..
echo "done!"
