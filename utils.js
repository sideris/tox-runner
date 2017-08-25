'use strict'
const ini = require("ini");
const fs = require('fs');
const constants = require('./constants');

module.exports.getToxConfig = () => {
    return findFile(constants.TOX_FILE, true)
};

module.exports.getToxotisConfig = () => {
    return findFile(constants.TOXOTIS_FILE)
};

module.exports.createToxotisConfig = (values) => {
    values = values || "";
    fs.writeFile(constants.TOXOTIS_FILE, JSON.stringify(values, null, 4), err => {
        if(err) return console.log(err)
        console.log(`Created ${constants.TOXOTIS_FILE}!`)
    });
};

const findFile = (file, isIni) => {
    isIni = isIni || false
    let parseMethod = isIni ? ini.parse : JSON.parse
    try {
        return parseMethod(fs.readFileSync(file, 'utf-8'))
    } catch (err) {
        console.error(`${file} not found`)
    }
};