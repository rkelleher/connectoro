#!/usr/bin/sh
cd client
yarn build
cd ..

rm -r server/static
cp -r client/build server/static

cd server
# gcloud app deploy
cd ..
echo "done!"
