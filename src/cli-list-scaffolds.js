#!/usr/bin/env node
const program = require("commander");
const lib = require("./lib");

program.action(lib.listScaffolds).parse(process.argv);
