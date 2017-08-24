#! /usr/bin/env node
'use strict';
const cmder = require('commander');
const utils = require( "./utils");
const path = require("path");
const constants = require("./constants.js");
const exec = require('child_process').exec;
const ask = require('node-ask').ask;

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
            if (utils.getToxotisConfig()) {
                console.log('There is already a config file. Edit that, please.');
                return;
            }
            makeConfig();
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
const changeList = exec(diffCommand);
promiseFromChildProcess(changeList);
changeList.stdout.on('data',  data => {
    const dators = data.split("\n");
    dators.forEach(v => {
        const projectName = v.split("/")[0];
        console.log(projectName, path.extname(projectName))
    })
});
changeList.stderr.on('data',  err => { throw err; });
changeList.on('close', function (code) {});

function makeConfig() {
    let toxotisConfig = {};
    const toxIni = utils.getToxConfig();
    if (!toxIni) return;
    let questions = []
    for(let item in toxIni) {
        let toxParams = item.split(':');

        if (toxParams.length < 2 || toxParams[0] !== 'testenv')
            continue;

        const env = toxParams[1];
        if (env === 'flake8') {
            toxotisConfig[env] = {runs: constants.runs.ALWAYS, folder: undefined};
            continue;
        }
        questions.push({
            key: env,
            msg: `env: ${env} folder: `,
            fn: 'prompt'
        });
    }
    console.log('Press enter to skip or enter the top level folder that you ' +
        'want to detect changes for the corresponding tox environment');
    ask(questions)
        .then(answers => {
            for(let env in answers) {
                let value = answers[env];
                if (value.replace(' ', '') !== '')
                    toxotisConfig[env] = {runs: constants.runs.ON_CHANGE, folder: value};
            }
        })
        .then(() => utils.createToxotisConfig(toxotisConfig))
        .catch(ex => console.log(ex.stack));

}
