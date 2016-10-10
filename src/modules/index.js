import fs from 'fs';
import path from 'path';

const modules = {};
export default modules;

// Load all subdirectories as RUNMETEOR modules.
// The directory name is the module name.
fs.readdirSync(__dirname)
    .filter(isModule)
    .forEach(loadModule);

function isModule(name) {
    const moduleDir = path.join(__dirname, name);
    return fs.statSync(moduleDir).isDirectory();
}

function loadModule(name) {
    const moduleDir = path.join(__dirname, name);
    modules[name] = require(moduleDir);
}