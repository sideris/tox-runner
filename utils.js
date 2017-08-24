const ini = require("ini");
const fs = require('fs');
const constants = require('./constants')

module.exports.getToxConfig = () => {
    return findFile(constants.TOX_FILE)
};

module.exports.getToxotisConfig = () => {
    return findFile(constants.TOXOTIS_FILE)
};

module.exports.createToxotisConfig = (values) => {
    values = values || "";
    fs.writeFile(constants.TOXOTIS_FILE, JSON.stringify(values, null, 4), err => {
        if(err) return console.log(err);
        console.log(`Created ${constants.TOXOTIS_FILE}!`);
    });
};

const findFile = file => {
    try {
        return ini.parse(fs.readFileSync(file, 'utf-8'));
    } catch (err) {
        console.error(`${file} not found`)
    }
};