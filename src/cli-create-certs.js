#!/usr/bin/env node
const program = require("commander");
const lib = require("./lib");

program
  .option("--output-dir <dir>", "Output folder")
  .option("--server-mame <name>", "Name used for the furmly server certificate")
  .option(
    "--proxy-name <name>",
    "Name used for the furmly-studio proxy certificate"
  )
  .option(
    "--client-name <name>",
    "Name used for the furmly-studio client certificate \n\t(client certs are presented by furmly studio for elevated permissions)"
  )
  .option("--client-only", "Generate only client certificate for furmly-studio")
  .option("--ca <path>", "Location of existing ca certificate for signing")
  .action(lib.createCerts.bind(lib, program))
  .parse(process.argv);
