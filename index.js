#! /usr/bin/env node
'use strict'
const cmder = require('commander')
const utils = require( "./utils")
const path = require("path")
const constants = require("./constants.js")
const exec = require('child_process').exec
const ask = require('node-ask').ask
let changes = []

cmder
    .version('1.0.1')
    .command('init')
    .description("Initializes a tox-runner project if it hasn't already been.")
    .action( () => {
        const toxIni = utils.getToxConfig()
        if (toxIni) {
            if (utils.getToxotisConfig()) {
                console.log('There is already a config file. Edit that, please.')
                return
            }
            makeConfig()
        }
    })

cmder.version('1.0.1')
    .option('-e, --env', 'Run tox regularly.')
    .option('-a, --all', 'Run all tests.')
    .option('-pc, --precommit', 'Check difference after adding files. Useful precommit hook.')
cmder.parse(process.argv)

function promiseFromChildProcess(child) {
    return new Promise(function (resolve, reject) {
        child.addListener("error", reject)
        child.addListener("exit", resolve)
    })
}

const diffCommand = cmder.precommit ? constants.COMMAND_PRE_COMMIT : constants.COMMAND
const changeList = exec(diffCommand)
promiseFromChildProcess(changeList)
changeList.stdout.on('data',  data => {
    const changes = data.split("\n")
})
changeList.stderr.on('data',  err => { throw err })
changeList.on('close', function (code) {})

let command;
if (cmder.all)
    command = exec(`tox`)
else if (cmder.env) // FIXME yeah that doesn't work
    command = exec(`tox -e ${cmder.env}`)
else if(process.argv.length === 2)
    command = run(changes)
if(command)
command.stdout.pipe(process.stdout)


function makeConfig() {
    let toxotisConfig = {}
    const toxIni = utils.getToxConfig()
    if (!toxIni) return
    let questions = []
    for(let item in toxIni) {
        let toxParams = item.split(':')

        if (toxParams.length < 2 || toxParams[0] !== 'testenv')
            continue

        const env = toxParams[1]
        if (env === 'flake8') {
            toxotisConfig[env] = {runs: constants.runs.ALWAYS, folder: undefined}
            continue
        }
        questions.push({
            key: env,
            msg: `env: ${env} folder: `,
            fn: 'prompt'
        })
    }
    console.log('Press enter to skip or enter the top level folder that you ' +
        'want to detect changes for the corresponding tox environment')
    ask(questions)
        .then(answers => {
            for(let env in answers) {
                let value = answers[env]
                if (value.replace(' ', '') !== '')
                    toxotisConfig[env] = {runs: constants.runs.ON_CHANGE, folder: value}
            }
        })
        .then(() => utils.createToxotisConfig(toxotisConfig))
        .catch(ex => console.log(ex.stack))
}

function run(changes) {
    let config = utils.getToxotisConfig()
    let folderMapping = {}
    let alwaysRun = []
    for (let env in config) {
        let x = config[env]
        if (x.folder) {
            if(folderMapping.hasOwnProperty(x.folder))
                folderMapping[x.folder].envs.push(env)
            else
                folderMapping[x.folder] = {runs: x.runs, envs: [env]}
        } else {
            if(x.runs === constants.runs.ALWAYS)
                alwaysRun.push(env)
        }
    }
    let tasks = [].concat(alwaysRun)
    changes.forEach(v => {
        const projectName = v.split("/")[0]
        if(folderMapping[projectName]) {
            tasks = tasks.concat(folderMapping[projectName].envs)
        }
    })
    let environments = tasks.reduce((x, y) => x + y + ",", "")
    environments = environments.substr(0, environments.length - 1)
    let toxCommand = `tox -e ${environments}`;
    console.log(`Running ${toxCommand}`)
    return exec(toxCommand)
}
