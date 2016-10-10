import modules from './modules/';
import RunMeteorApi from './runmeteor-api';
import program from 'commander';

let settingsPath;
let configPath;
const args = process.argv.slice(2);

program
    .arguments('<arg> [subarg]')
    .action(argAction)
    .option('--config <filePath>', 'runmeteor.js.sample config file', setConfigPath)
    .parse(process.argv);

function argAction(arg, subarg) {

    let moduleArg = arg;
    let command = subarg;

    if(!command && !modules[moduleArg]) {
        command = moduleArg;
        moduleArg = 'default';
    }

    let module;

    if(modules[moduleArg]) {
        module = modules[moduleArg];
    } else {
        console.error('No such module');
    }

    if(!command) {
        // module.help(args);
        process.exit(0);
    }

    if (!module[command]) {
        console.error('error: unknown command %s', command);
        // module.help(args);
        process.exit(1);
    }

    if(program.config) {
        args.splice(0, 2);
    }

    const base = process.cwd();
    const api = new RunMeteorApi(base, args, configPath);
    module[command](api);
}

function handleErrors(e) {
    console.log(e.name, e.message);
    process.exit(1);
}

function setConfigPath(configPathArg) {
    configPath = configPathArg;
}

process.on('uncaughtException', handleErrors);