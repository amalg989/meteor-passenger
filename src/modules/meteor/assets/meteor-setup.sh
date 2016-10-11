#!/bin/bash

sudo mkdir -p /opt/<%= name %>/
sudo mkdir -p /opt/<%= name %>/config
sudo mkdir -p /opt/<%= name %>/tmp
sudo mkdir -p /opt/<%= name %>/deploy
sudo chown ${USER} /opt/<%= name %> -R