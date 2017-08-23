#! /usr/bin/env node
const cmder = require('commander');
const utils = require( "./utils");
const path = require("path");
var constants = require("./constants.js");
const exec = require('child_process').exec;

function promiseFromChildProcess(child) {
    return new Promise(function (resolve, reject) {
        child.addListener("error", reject);
        child.addListener("exit", resolve);
    });
}



cmder
    .version('1.0.1')
    .command('init')
    .description("Initializes a tox-runner project if it hasn't already been.")
    .action( () => {
        const toxIni = utils.getToxConfig();
        if (toxIni) {
            if (utils.getToxotisConfig())
                return;
            utils.createToxotisConfig()
        }
    });

cmder.version('1.0.1')
    .option('-e, --env', 'Run tox regularly.')
    .option('-a, --all', 'Run all tests.')
    .option('-pc, --precommit', 'Check difference after adding files. Useful precommit hook.');
cmder.parse(process.argv);

if (cmder.all)
    exec(`tox`);
else if (cmder.env)
    exec(`tox -e ${cmder.env}`);

const diffCommand = cmder.precommit ? constants.COMMAND_PRE_COMMIT : constants.COMMAND;
const changeList = exec(diffCommand)
promiseFromChildProcess(changeList);
changeList.stdout.on('data',  data => {
    const dators = data.split("\n")
    dators.forEach(v => {
        const projectName = v.split("/")[0];
        console.log(projectName, path.extname(projectName))
    })
});
changeList.stderr.on('data',  err => { throw err; });
changeList.on('close', function (code) {
    console.log('closing code: ' + code);
});




