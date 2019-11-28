#!/usr/bin/sh
scripts/build-client.sh
scripts/build-server.sh

cp -r client/build server/dist/static

cd server
# gcloud app deploy
cd ..
echo "done!"
