#!/usr/bin/env node
var program = require("commander");

program
  .version("0.1.0")
  .command("list-scaffolds", "list scaffolds available", { isDefault: true })
  .command(
    "run-scaffold [scaffoldName]",
    "runs a scaffold or displays scaffolds in the registry"
  )
  .parse(process.argv);
