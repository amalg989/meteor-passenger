import path from 'path';
import debug from 'debug';
import sh from 'shelljs';
import * as meteor from '../meteor/';
import * as passenger from '../passenger/';
import * as mongo from '../mongo/';

sh.config.silent = true;

export function deploy(api) {
    return meteor.deploy(api);
}

export function init() {
    // TODO check if runmeteor.js.sample files exists
    const runmeteorJs = path.resolve(__dirname, 'template/runmeteor.js.sample');
    const runmeteorJsDst = path.resolve(process.cwd(), 'runmeteor.js');

    sh.cp(runmeteorJs, runmeteorJsDst);
}

export function logs(api) {
    return meteor.logs(api);
}

export function reconfig(api) {
    return meteor.envconfig(api)
        .then(() => meteor.start(api));
}

export function restart(api) {
    return meteor.stop(api)
        .then(() => meteor.start(api));
}

export function setup(api) {
    const config = api.getConfig();
    return passenger.setup(api)
        .then(() => {
            if (config.mongo) {
                return Promise.all([
                    meteor.setup(api),
                    mongo.setup(api)
                ]).then(() => (mongo.start(api)));
            }
            return meteor.setup(api);
        });
}

export function start(api) {
    return meteor.start(api);
}

export function stop(api) {
    return meteor.stop(api);
}


