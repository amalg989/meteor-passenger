#!/bin bash

APPNAME=<%= appName %>
APP_PATH=/opt/$APPNAME
BUNDLE_PATH=$APP_PATH/current
ENV_FILE=$APP_PATH/config/env.list
PORT=<%= port %>
PASSENGER_JSON_PATH=$APP_PATH/config/Passengerfile.json

cd $BUNDLE_PATH
sudo chmod 777 bundle.tar.gz
sudo tar xzf bundle.tar.gz
sudo chmod 777 -R bundle
sudo cp -rf bundle $APP_PATH/deploy
cd $APP_PATH/deploy/bundle/programs/server
sudo npm install --unsafe-perm
sudo cp $PASSENGER_JSON_PATH $APP_PATH/deploy/bundle/Passengerfile.json
