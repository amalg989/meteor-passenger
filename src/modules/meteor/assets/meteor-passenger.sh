#!/bin bash

APPNAME=<%= appName %>
APP_PATH=/opt/$APPNAME
BUNDLE_PATH=$APP_PATH/current
ENV_FILE=$APP_PATH/config/env.list
PORT=<%= port %>
PASSENGER_JSON_PATH=$APP_PATH/config/Passengerfile.json
passengerLockedFile="passenger.pid"

set -e

# save the last known version
cd $APP_PATH
if [[ -d current ]]; then
  if [ -f "$passengerLockedFile" ]
  then
    cd $APP_PATH/deploy/bundle
    sudo passenger stop
  else
    cd $APP_PATH
    sudo rm -rf last
    sudo mv current last
  fi
fi

# setup the new version
sudo mkdir current
sudo cp tmp/bundle.tar.gz current/

# start building meteor bundle
cd $BUNDLE_PATH
sudo chmod 777 bundle.tar.gz
sudo tar xzf bundle.tar.gz
sudo chmod 777 -R bundle
sudo cp -rf bundle $APP_PATH/deploy
cd $APP_PATH/deploy/bundle/programs/server
sudo npm install --unsafe-perm
sudo cp $PASSENGER_JSON_PATH $APP_PATH/deploy/bundle/Passengerfile.json
