#!/bin/bash

APPNAME=<%= appName %>
APP_PATH=/opt/$APPNAME
BUNDLE_PATH=$APP_PATH/current
ENV_FILE=$APP_PATH/config/env.list
PORT=<%= port %>
PASSENGER_JSON = <%= passengerJSON %>

sudo cp -rf $BUNDLE_PATH/package.tar.gz ~/
sudo chmod 777 ~/package.tar.gz
cd ~
tar xzf package.tar.gz
cd bundle/program/server
npm install --production
sudo cp -rf bundle $APP_PATH
echo $PASSENGER_JSON > $APP_PATH/bundle
cd $APP_PATH/bundle && sudo passenger start

