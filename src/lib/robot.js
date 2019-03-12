const search = require("libnpmsearch");
const { spawnSync } = require("child_process");
const { unlinkSync, existsSync, mkdirSync } = require("fs");
const npx = require("libnpx");
const inquirer = require("inquirer");
const chalk = require("chalk").default;
const which = require("which");
const log = console.log;

const copy = (...args) => {
  log(chalk.grey.apply(chalk.gray, args));
};
const info = (...args) => {
  log(chalk.bold.cyanBright.apply(null, args));
};
const error = (...args) => {
  log(chalk.red.apply(null, args));
};
const getAppDataFolder = () => {
  let folder;
  if (process.env.APPDATA) {
    folder = process.env.APPDATA;
  } else {
    folder =
      process.platform == "darwin"
        ? process.env.HOME + "Library/Preferences"
        : "/var/local";
  }
  return `${folder}/furmly-cli`;
};
const signCert = (ran, certName, ca, options, caKey) => {
  info(`${ran}a. create private key for ${certName}.`);
  const completeServerKey = `${certName}-key.pem`;
  const tempCSR = `${certName}-temp-csr.pem`;
  let createSRL = ["-CAcreateserial"];
  let serialFile = ca.replace(".pem", ".srl");
  if (existsSync(serialFile)) {
    createSRL[0] = "-CAserial";
    createSRL.push(serialFile);
  }

  spawnSync("openssl", ["genrsa", "-out", completeServerKey, 4096], options);

  info(`${ran}b. create certificate signing request`);
  spawnSync(
    "openssl",
    ["req", "-new", "-key", completeServerKey, "-out", tempCSR],
    options
  );

  info(`${ran}c. sign csr using ca certificate`);
  spawnSync(
    "openssl",
    [
      "x509",
      "-req",
      "-days",
      999,
      "-passin",
      "pass:password",
      "-in",
      tempCSR,
      "-CA",
      ca,
      "-CAkey",
      caKey,
      ...createSRL,
      "-out",
      `${certName}-crt.pem`
    ],
    options
  );
  info("cleaning up csr...");
  unlinkSync(`${options.cwd}/${tempCSR}`);
};
const PREFIX = "generator-furmly-";
class Robot {
  constructor(settings = {}) {
    this.listScaffolds = this.listScaffolds.bind(this);
    this.runScaffold = this.runScaffold.bind(this);
    this.createCerts = this.createCerts.bind(this);
    this.prefix = settings.prefix || PREFIX;
  }
  async _listScaffolds(query) {
    info("fetching scaffolds...");
    const packages = await search(`/${this.prefix}${query || "(.)"}/`);
    return packages;
  }

  async createCerts({
    outputDir = getAppDataFolder(),
    caName = "ca",
    ca,
    caKey,
    serverName = "server",
    clientName = "client",
    proxyName = "proxy",
    clientOnly
  }) {
    try {
      info("running self signed certificate generation...");
      info("certificates are required by:-");
      ["furmly-studio", "furmly-server"].forEach((x, index) =>
        info(`${index + 1} ${x}`)
      );
      const completeCaKey = `${caName}-key.pem`;
      const completeCa = `${caName}-crt.pem`;
      const options = {
        cwd: outputDir,
        stdio: "inherit",
        shell: true
      };
      let ran = 1;
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir);
      }
      log("------------------------------");
      if (!ca) {
        info(`${ran++}. create certificate authority.`);
        spawnSync("openssl", ["genrsa", "-out", completeCaKey, 4096], options);
        spawnSync(
          "openssl",
          [
            "req",
            "-new",
            "-x509",
            "-days",
            9999,
            "-key",
            completeCaKey,
            "-out",
            completeCa
          ],
          options
        );
        ca = `${outputDir}/${completeCa}`;
      }
      const certs = [clientName];
      if (!clientOnly) {
        certs.push(proxyName);
        certs.push(serverName);
      }
      for (let i = 0; i < certs.length; i++) {
        signCert(ran + i, certs[i], ca, options, caKey || completeCaKey);
      }
    } catch (e) {
      error(e);
    }
  }
  async listScaffolds() {
    try {
      const packages = await this._listScaffolds();
      packages.map((p, index) => {
        log(chalk.green.bold(`${index + 1}. ${p.name}`));
        copy(p.description);
        log(chalk.grey("------------------------------"));
      });
    } catch (e) {
      error(e.message);
    }
  }
  async runScaffold(packageName) {
    try {
      if (!packageName || typeof packageName !== "string") {
        const packages = await this._listScaffolds();
        if (!packages.length) {
          log(info("there are no packages available right now."));
          return;
        }
        const answers = await inquirer.prompt([
          {
            name: "scaffold",
            choices: packages.map(x => x.name),
            type: "list",
            message: "Please select a scaffold to run"
          }
        ]);
        packageName = answers.scaffold;
      }
      info(`running scaffold ${packageName}...`);
      const args = npx.parseArgs(
        ["-p", "yo", "-p", packageName, "-c", `yo ${packageName}`],
        which.sync("npm")
      );
      await npx(args);
    } catch (e) {
      error(e.message);
      process.exit(-1);
    }
  }
}

module.exports = Robot;
