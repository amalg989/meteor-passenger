#!/bin/bash

APPNAME=<%= appName %>
APP_PATH=/opt/$APPNAME

cd $APP_PATH/deploy/bundle
sudo passenger start