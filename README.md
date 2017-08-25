# Toxotis
---

Toxotis is a configurable utility that enables you to run only the tests for environments that have changed.
Just call `toxotis`.

## Install
`npm i -g toxotis`
or
`yarn add global toxotis`

## Options

`init` :

Initialize the toxotis project with a `toxotis.json`.
It will ask you questions regarding the mapping of tox environments to specific folders.
Fails if it does not find a `tox.ini`

`-e, --env` :

Runs tox regularly.
Note: does not work yet

`-a, --all`

Runs all environments.
Similar to just running `tox`

`-pc, --precommit`

This will check for files that have either been commited or just added for staging.
