const assert = require("assert");
const proxy = require("proxyquire");
const sinon = require("sinon");
const fixtures = {
  packages: [
    { name: "generator-furmly-test", description: "fake description" },
    { name: "generator-furmly-test2", description: "fake description 2" }
  ]
};
const inquirer = {
  prompt: sinon.spy(async function(args) {
    assert.equal(args.length == 1, true);
    assert.equal(args[0].choices.length == 2, true);
    return { scaffold: args[0].choices[0].name };
  })
};
const libnpmsearch = sinon.spy(function(query) {
  return new Promise(resolve => resolve(fixtures.packages));
});
const libnpxFn = function(args) {};
libnpxFn.parseArgs = function() {};
const libnpx = sinon.spy(libnpxFn);
const Robot = proxy("../lib/robot", {
  libnpx,
  inquirer,
  libnpmsearch
});
const robot = new Robot();
describe("Robot can run scaffold", function() {
  beforeEach(() => {
    inquirer.prompt.resetHistory();
    libnpmsearch.resetHistory();
    libnpx.resetHistory();
  });
  it("it should return a selectable list of scaffolds and run on select.", async function() {
    await robot.runScaffold();
    assert.equal(
      inquirer.prompt.calledOnce,
      true,
      "user must be prompted to select a scaffold"
    );
    assert.equal(
      libnpx.calledOnce,
      true,
      "the selected scaffold must be called."
    );
  });
  it("it should run the passed scaffold", async function() {
    await robot.runScaffold(fixtures.packages[0].name);
    assert.equal(
      inquirer.prompt.callCount == 0,
      true,
      "user must not be prompted to select a scaffold"
    );
    assert.equal(
      libnpx.calledOnce,
      true,
      "the selected scaffold must be called."
    );
    
  });
});
