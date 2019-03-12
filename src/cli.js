#!/usr/bin/env node
var program = require("commander");

program
  .version("0.0.1")
  .command("list-scaffolds", "list scaffolds available", { isDefault: true })
  .command(
    "run-scaffold [scaffoldName]",
    "runs a scaffold or displays scaffolds in the registry"
  )
  .command(
    "create-certs",
    "creates self signed certificates using certificate-providers (e.g openssl)"
  )
  .parse(process.argv);
