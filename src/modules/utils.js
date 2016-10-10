import fs from 'fs';
import * as _ from 'underscore';
import {promisify} from 'bluebird';
import {Client} from 'ssh2';
import path from 'path';

export function runTaskList(list, sessions, opts) {
    return new Promise((resolve, reject) => {
        list.run(sessions, opts, summaryMap => {
            for (var host in summaryMap) {
                const summary = summaryMap[host];
                if (summary.error) {
                    reject(summary.error);
                    return;
                }
            }

            resolve();
        });
    });
}

export function getPassengerLogs(name, sessions, args) {
    const command = 'cd /opt/' + name + ' && sudo tail -f passenger.log';

    var promises = _.map(sessions, session => {
        var host = '[' + session._host + ']';
        var options = {
            onStdout: data => {
                process.stdout.write(host + data);
            },
            onStderr: data => {
                process.stdout.write(host + data);
            }
        };
        return promisify(session.execute.bind(session))(command, options);
    });
    return Promise.all(promises);
}

// Maybe we should create a new npm package
// for this one. Something like 'sshelljs'.
export function runSSHCommand(info, command) {
    return new Promise((resolve, reject) => {
        const conn = new Client();

        // TODO better if we can extract SSH agent info from original session
        var sshAgent = process.env.SSH_AUTH_SOCK;
        var ssh = {
            host: info.host,
            port: (info.opts && info.opts.port || 22),
            username: info.username
        };

        if (info.pem) {
            ssh.privateKey = fs.readFileSync(path.resolve(info.pem), 'utf8');
        } else if (info.password) {
            ssh.password = info.password;
        } else if (sshAgent && fs.existsSync(sshAgent)) {
            ssh.agent = sshAgent;
        }
        conn.connect(ssh);

        conn.once('error', function (err) {
            if (err) {
                reject(err);
            }
        });

        // TODO handle error events
        conn.once('ready', function () {
            conn.exec(command, function (err, stream) {
                if (err) {
                    conn.end();
                    reject(err);
                    return;
                }

                let output = '';

                stream.on('data', function (data) {
                    output += data;
                });

                stream.once('close', function (code) {
                    conn.end();
                    resolve({code, output});
                });
            });
        });
    });
}

export function countOccurences(needle, haystack) {
    const regex = new RegExp(needle, 'g');
    const match = haystack.match(regex) || [];
    return match.length;
}