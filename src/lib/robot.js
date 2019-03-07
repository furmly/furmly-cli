const search = require("libnpmsearch");
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
const PREFIX = "generator-furmly-";
class Robot {
  constructor(settings = {}) {
    this.listScaffolds = this.listScaffolds.bind(this);
    this.runScaffold = this.runScaffold.bind(this);
    this.prefix = settings.prefix || PREFIX;
  }
  async _listScaffolds(query) {
    info("fetching scaffolds...");
    const packages = await search(`/${this.prefix}${query || "(.)"}/`);
    return packages;
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
