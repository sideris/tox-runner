module.exports = {
    TOX_FILE: "tox.ini",
    TOXOTIS_FILE: "toxotis.json",
    DEFAUlT_TOX_ENVS: [
        'py', 'py2', 'py26', 'py27', 'py3', 'py33', 'py34',
        'py35', 'py36', 'py37', 'jython', 'pypy', 'pypy3',
    ],
    COMMAND: "git diff --name-only HEAD",
    COMMAND_PRE_COMMIT: "git diff --name-only @{upstream}",
    runs: {
        ALWAYS: 'always',
        ON_CHANGE: 'change'
    }
};