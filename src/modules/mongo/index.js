import path from 'path';
import debug from 'debug';
import nodemiral from 'nodemiral';
import {runTaskList, getPassengerLogs} from '../utils';

export function logs(api) {
    const args = api.getArgs();
    const sessions = api.getSessions([ 'meteor' ]);
    return getPassengerLogs('meteor', sessions, args);
}

export function setup(api) {
    const mongoSessions = api.getSessions([ 'mongo' ]);
    const meteorSessions = api.getSessions([ 'meteor' ]);

    if ( mongoSessions[0]._host !== meteorSessions[0]._host ) {
        console.log('To use runmeteor mongodb setup, you should have both meteor app and mongodb on the same server');
        return;
    }

    const list = nodemiral.taskList('Setup Mongo');

    list.executeScript('setup environment', {
        script: path.resolve(__dirname, 'assets/mongo-setup.sh')
    });

    list.copy('copying mongodb.conf', {
        src: path.resolve(__dirname, 'assets/mongodb.conf'),
        dest: '/opt/mongodb/mongodb.conf'
    });

    const sessions = api.getSessions([ 'mongo' ]);

    return runTaskList(list, sessions);
}

export function start(api) {
    const mongoSessions = api.getSessions([ 'mongo' ]);
    const meteorSessions = api.getSessions([ 'meteor' ]);

    if (mongoSessions[0]._host !== meteorSessions[0]._host) {
        log('Skipping mongodb start. Incompatible config');
        return;
    }

    const list = nodemiral.taskList('Start Mongo');

    list.executeScript('start mongo', {
        script: path.resolve(__dirname, 'assets/mongo-start.sh')
    });

    const sessions = api.getSessions([ 'mongo' ]);
    return runTaskList(list, sessions);
}

export function stop(api) {
    const list = nodemiral.taskList('Stop Mongo');

    list.executeScript('stop mongo', {
        script: path.resolve(__dirname, 'assets/mongo-stop.sh')
    });

    const sessions = api.getSessions([ 'mongo' ]);
    return runTaskList(list, sessions);
}