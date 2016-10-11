import path from 'path';
import debug from 'debug';
import nodemiral from 'nodemiral';
import {runTaskList} from '../utils';

export function setup(api) {
    const list = nodemiral.taskList('Setup Passenger Open Source (Standalone)');

    list.executeScript('Setup Passenger', {
        script: path.resolve(__dirname, 'assets/passenger-setup.sh')
    });

    const sessions = api.getSessions([ 'meteor', 'mongo']);
    const rsessions = sessions.reduce((prev, curr) => {
        if (prev.map(session => session._host).indexOf(curr._host) === -1) {
            prev.push(curr);
        }
        return prev;
    }, []);
    return runTaskList(list, rsessions);
}