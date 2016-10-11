#!/bin/bash

APPNAME=<%= appName %>
APP_PATH=/opt/$APPNAME

set -e

# start app
cd $APP_PATH
sudo bash config/start.sh