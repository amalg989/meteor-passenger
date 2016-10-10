import path from 'path';
import debug from 'debug';
import nodemiral from 'nodemiral';
import uuid from 'uuid';
import * as _ from 'underscore';
import buildApp from './build.js';

export function logs(api) {
    const config = api.getConfig().meteor;
    if (!config) {
        console.error('error: no configs found for meteor');
        process.exit(1);
    }

    const args = api.getArgs();
    const sessions = api.getSessions([ 'meteor' ]);
    return getPassengerLogs(config.name, sessions, args);
}

export function setup(api) {
    const config = api.getConfig().meteor;
    if (!config) {
        console.error('error: no configs found for meteor');
        process.exit(1);
    }

    const list = nodemiral.taskList('Setup Meteor');

    list.executeScript('Setup Environment', {
        script: path.resolve(__dirname, 'assets/meteor-setup.sh'),
        vars: {
            name: config.name,
        },
    });

    // if (config.ssl) {
    //     const basePath = api.getBasePath();
    //
    //     if (config.ssl.upload !== false) {
    //         list.copy('Copying SSL Certificate Bundle', {
    //             src: path.resolve(basePath, config.ssl.crt),
    //             dest: '/opt/' + config.name + '/config/bundle.crt'
    //         });
    //
    //         list.copy('Copying SSL Private Key', {
    //             src: path.resolve(basePath, config.ssl.key),
    //             dest: '/opt/' + config.name + '/config/private.key'
    //         });
    //     }
    //
    //     list.executeScript('Verifying SSL Configurations', {
    //         script: path.resolve(__dirname, 'assets/verify-ssl-config.sh'),
    //         vars: {
    //             name: config.name
    //         },
    //     });
    // }

    const sessions = api.getSessions([ 'meteor' ]);

    return runTaskList(list, sessions);
}

export function push(api) {
    const config = api.getConfig().meteor;
    if (!config) {
        console.error('error: no configs found for meteor');
        process.exit(1);
    }

    var buildOptions = config.buildOptions || {};
    buildOptions.buildLocation = buildOptions.buildLocation || path.resolve('/tmp', uuid.v4());

    console.log('Building App Bundle Locally');

    var bundlePath = path.resolve(buildOptions.buildLocation, 'bundle.tar.gz');
    const appPath = path.resolve(api.getBasePath(), config.path);

    return buildApp(appPath, buildOptions)
        .then(() => {
            config.log = config.log || {
                    opts: {
                        'max-size': '100m',
                        'max-file': 10
                    }
                };
            const list = nodemiral.taskList('Pushing Meteor');

            list.copy('Pushing Meteor App Bundle to The Server', {
                src: bundlePath,
                dest: '/opt/' + config.name + '/tmp/bundle.tar.gz',
                progressBar: config.enableUploadProgressBar
            });

            var passengerJson = '{' +
                '// Tell Passenger that this is a Meteor app.' +
                '"app_type": "node",' +
                '"startup_file": "main.js",' +
                '"envvars": {' +
                '// Tell your app where MongoDB is' +
                '"MONGO_URL": "mongodb://localhost:27017/'+config.name+'",' +
                '// Tell your app what its root URL is' +
                '"ROOT_URL": "'+config.env.ROOT_URL+'",' +
                '},' +
                '// Store log and PID file in parent directory' +
                '"log_file": "/opt/'+config.name+'/passenger.log",' +
                '"pid_file": "/opt/'+config.name+'/passenger.pid"' +
                '// Run the app in a production environment. The default value is "development".' +
                '"environment": "production",' +
                '// Run Passenger on port 80, the standard HTTP port.' +
                '"port": '+(config.env.PORT || 80)+',' +
                '// Tell Passenger to daemonize into the background.' +
                '"daemonize": true' +
                '}';

            list.copy('Pushing the Startup Script', {
                src: path.resolve(__dirname, 'assets/templates/start.sh'),
                dest: '/opt/' + config.name + '/config/start.sh',
                vars: {
                    appName: config.name,
                    useLocalMongo: api.getConfig().mongo ? 1 : 0,
                    port: config.env.PORT || 80,
                    sslConfig: config.ssl,
                    logConfig: config.log,
                    passengerJson: passengerJson
                }
            });

            const sessions = api.getSessions([ 'meteor' ]);
            return runTaskList(list, sessions, {series: true});
        });
}

export function envconfig(api) {
    const config = api.getConfig().meteor;
    if (!config) {
        console.error('error: no configs found for meteor');
        process.exit(1);
    }

    const list = nodemiral.taskList('Configuring Meteor Environment Variables');

    var env = _.clone(config.env);

    // sending PORT to the docker container is useless.
    // It'll run on PORT 80 and we can't override it
    // Changing the port is done via the start.sh script
    delete env.PORT;

    list.copy('Sending Environment Variables', {
        src: path.resolve(__dirname, 'assets/templates/env.list'),
        dest: '/opt/' + config.name + '/config/env.list',
        vars: {
            env: env || {},
            appName: config.name
        }
    });
    const sessions = api.getSessions([ 'meteor' ]);
    return runTaskList(list, sessions, {series: true});
}

export function start(api) {
    const config = api.getConfig().meteor;
    if (!config) {
        console.error('error: no configs found for meteor');
        process.exit(1);
    }

    const list = nodemiral.taskList('Start Meteor');

    list.executeScript('Start Meteor', {
        script: path.resolve(__dirname, 'assets/meteor-start.sh'),
        vars: {
            appName: config.name
        }
    });

    // list.executeScript('Verifying Deployment', {
    //     script: path.resolve(__dirname, 'assets/meteor-deploy-check.sh'),
    //     vars: {
    //         deployCheckWaitTime: config.deployCheckWaitTime || 60,
    //         appName: config.name,
    //         port: config.env.PORT || 80
    //     }
    // });

    const sessions = api.getSessions([ 'meteor' ]);
    return runTaskList(list, sessions, {series: true});
}

export function deploy(api) {
    const config = api.getConfig().meteor;
    if (!config) {
        console.error('error: no configs found for meteor');
        process.exit(1);
    }

    return push(api)
        .then(() => envconfig(api))
        .then(() => start(api));
}

export function stop(api) {
    const config = api.getConfig().meteor;
    if (!config) {
        console.error('error: no configs found for meteor');
        process.exit(1);
    }

    const list = nodemiral.taskList('Stop Meteor');

    list.executeScript('Stop Meteor', {
        script: path.resolve(__dirname, 'assets/meteor-stop.sh'),
        vars: {
            appName: config.name
        }
    });

    const sessions = api.getSessions([ 'meteor' ]);
    return runTaskList(list, sessions);
}