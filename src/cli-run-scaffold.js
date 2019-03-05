#!/usr/bin/env node
const program = require("commander");
const lib = require("./lib");

program
  .arguments("[packageName]")
  .action(lib.runScaffold)
  .parse(process.argv);
