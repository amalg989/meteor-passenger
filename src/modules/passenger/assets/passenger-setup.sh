#!/bin/bash

# TODO server must be Ubuntu 16.04.x LTS version
# TODO make sure we can run passenger in this server

# Is Passenger & NodeJS already installed?
set +e
hasNodeJs=$(nodejs -v)
hasPassenger=$(passenger -v)
set -e

if [ ! "$hasNodeJs" ]; then
    # Remove the lock
    set +e
    sudo rm /var/lib/dpkg/lock > /dev/null
    sudo rm /var/cache/apt/archives/lock > /dev/null
    sudo dpkg --configure -a
    set -e

    # Required to update system
    sudo apt-get update
    sudo apt-get -y install wget lxc iptables curl

    sudo apt-get install -y curl apt-transport-https ca-certificates && curl --fail -ssL -o setup-nodejs https://deb.nodesource.com/setup_0.10 &&
  sudo bash setup-nodejs && sudo apt-get install -y nodejs build-essential
fi

if [ ! "$hasPassenger" ]; then
  # Remove the lock
  set +e
  sudo rm /var/lib/dpkg/lock > /dev/null
  sudo rm /var/cache/apt/archives/lock > /dev/null
  sudo dpkg --configure -a
  set -e

  # Required to update system
  sudo apt-get update
  sudo apt-get -y install wget lxc iptables curl

  # Install PGP Key and HTTPS support for APT
  sudo apt-get install -y curl apt-transport-https ca-certificates && curl --fail -ssL -o setup-nodejs https://deb.nodesource.com/setup_0.10 &&
  sudo bash setup-nodejs && sudo apt-get install -y nodejs build-essential && sudo apt-get install -y mongodb

  # Add APT repository
  sudo sh -c 'echo deb https://oss-binaries.phusionpassenger.com/apt/passenger xenial main > /etc/apt/sources.list.d/passenger.list'
  sudo apt-get update

  # Install Passenger
  sudo apt-get install -y passenger
fi