#!/bin/bash

APPNAME=<%= appName %>

cd /opt/$APPNAME/deploy/bundle
sudo passenger stop