# meteor-passenger

#### Production Quality Meteor Deployments using [Passenger Standalone Server](https://www.phusionpassenger.com)

This tool is a fork of [Meteor Up command line tool by Kadhira] (https://github.com/kadirahq/meteor-up) which uses Phusion Passenger server instead Docker.

Phusion Passenger is more **Fast & scalable**, **Easy setup** and **Stable & Reliable**. Most importantly unlike Docker Phusion Passenger doesnt consume server resources too much.

like meteor-up by kadhira, meteor-passenger also allows you to deploy any [Meteor](http://meteor.com) app to your own server and it currently supports Ubuntu too.

**Table of Contents**

- [Features](#features)
- [Installation](#installation)
- [Creating a Meteor Up Project](#creating-a-meteor-up-project)
- [Example File](#example-file)
- [Setting Up a Server](#setting-up-a-server)
- [Deploying an App](#deploying-an-app)
- [Build Options](#build-options)
- [Additional Setup/Deploy Information](#additional-setupdeploy-information)
    - [Server Setup Details](#server-setup-details)
    - [Multiple Deployment Targets](#multiple-deployment-targets)
- [Accessing the Database](#accessing-the-database)
- [Multiple Deployments](#multiple-deployments)
- [Updating](#updating-mup)

### Features

* Single command server setup
* Single command deployment
* Multi server deployment (Working in Progress)
* Environment Variables management
* Password or Private Key(pem) based server authentication
* Access, logs from the terminal (supports log tailing)
* Read, backup complete logs (Working in Progress)

### Installation

    npm install -g meteor-passenger

### Creating a Meteor Up Project
    cd my-app-folder
    mkdir .deploy
    cd .deploy
    runmeteor init

This will create a `runmeteor.js` Meteor Up configuration file in your Meteor Up project directory

### Example File

```js
module.exports = {
    servers: {
        one: {
            host: '192.168.12.25',
            username: 'root'
            // pem:
            // password:
            // or leave blank for authenticate from ssh-agent
        }
    },

    meteor: {
        name: 'app',
        path: '../app',
        servers: {
            one: {}
        },
        buildOptions: {
            serverOnly: true,
        },
        env: {
            ROOT_URL: 'app.com',
            MONGO_URL: 'mongodb://localhost/meteor'
        }
    },

    mongo: {
        oplog: true,
        port: 27017,
        servers: {
            one: {},
        },
    },
};
```

### Setting Up a Server

    runmeteor setup (best run this command as a super - sudo runmeteor setup)

This will setup the server for the deployments. It will take around 2-5 minutes depending on the server's performance and network availability.

### Deploying an App

    runmeteor deploy (best run this command as a super - sudo runmeteor deploy)

This will bundle the Meteor project and deploy it to the server. Bundling process is exactly how `meteor deploy` does it.

### Other Utility Commands

* `runmeteor reconfig` - reconfigure app with new environment variables and Meteor settings
* `runmeteor stop` - stop the app
* `runmeteor start` - start the app
* `runmeteor restart` - restart the app
* `runmeteor logs` - get logs

### Build Options

When building the meteor app, we can invoke few options. So, you can mention them in `mup.js` like this:

~~~js
...
meteor: {
  buildOptions: {
    // build with the debug mode on
    debug: true,
    // mobile setting for cordova apps
    mobileSettings: {
      public: {
        'meteor-up': 'rocks',
      }
    },
    // executable used to build the meteor project
    // you can set a local repo path if needed
    executable: 'meteor',
  }
}
...
~~~

### Additional Setup/Deploy Information

#### SSH keys with paraphrase (or ssh-agent support)

> This only tested with Mac/Linux

It's common to use paraphrase enabled SSH keys to add an extra layer of protection to your SSH keys. You can use those keys with `mup` too. In order to do that, you need to use a `ssh-agent`.

Here's the process:

* First remove your `pem` field from the `runmeteor.js`. So, your `runmeteor.js` only has the username and host only.
* Then start a ssh agent with `eval $(ssh-agent)`
* Then add your ssh key with `ssh-add <path-to-key>`
* Then you'll be asked to enter the paraphrase to the key
* After that simply invoke `runmeteor` commands and they'll just work
* Once you've deployed your app kill the ssh agent with `ssh-agent -k`

#### SSH based authentication with `sudo`

**If your username is `root` or using AWS EC2, you don't need to follow these steps**

Please ensure your key file (pem) is not protected by a passphrase. Also the setup process will require NOPASSWD access to sudo. (Since Meteor needs port 80, sudo access is required.)

Make sure you also add your ssh key to the `/YOUR_USERNAME/.ssh/authorized_keys` list

You can add your user to the sudo group:

    sudo adduser *username*  sudo

And you also need to add NOPASSWD to the sudoers file:

    sudo visudo

    # replace this line
    %sudo  ALL=(ALL) ALL

    # by this line
    %sudo ALL=(ALL) NOPASSWD:ALL

When this process is not working you might encounter the following error:

    'sudo: no tty present and no askpass program specified'

#### Server Setup Details

Meteor Up uses Phusion Passenger to run and manage your app. Here's how we manage and utilize the server.

* your currently running meteor bundle lives at `/opt/<appName>/current`.
* we've a demonized passenger container running the above bundle.
* logs are maintained via Phusion Passenger and available at /opt/<appName>/passenger.log.
* if you decided to use MongoDB,

    mongo <appName>

  It's bound to the local interface and port `27017`
* the database is named `<appName>`

#### Multiple Deployment Targets

[Working In Progress]

### Accessing the Database

You can access the MongoDB from the outside the server. To access the MongoDB shell you need to log into your server via SSH first and then run the following command:

    mongo <appName>

### Multiple Deployments

[Working In Progress]

### Changing `appName`

It's pretty okay to change the `appName`. But before you do so, you need to stop the project with older `appName`

### Updating Mup

To update `mup` to the latest version, just type:

    npm update meteor-passenger -g

You should try and keep `mup` up to date in order to keep up with the latest Meteor changes.