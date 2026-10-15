'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const yaml = require('js-yaml');

const workflowDir = path.join(__dirname, '../.github/workflows');
const deploy = yaml.load(fs.readFileSync(path.join(workflowDir, 'deploy-to-ec2.yml'), 'utf8'));
const restart = yaml.load(fs.readFileSync(path.join(workflowDir, 'restart-nodejs.yml'), 'utf8'));
const deployStep = deploy.jobs['deploy-to-ec2'].steps.find(
  step => step.name === 'Download and unzip code on EC2 via SSM'
).run;
const script = deployStep.split("<<'DEPLOY_SCRIPT'\n")[1].split('\nDEPLOY_SCRIPT')[0];
const preflight = script.split('S3_BUCKET="$1"')[0];
const build = script.split('echo "Installing dependencies..."\n')[1]
  .split('echo "Cleaning up temporary files..."')[0];
const restartSteps = restart.jobs['restart-node-service'].steps;

function run(scriptText, env = {}) {
  return spawnSync('bash', ['--noprofile', '--norc', '-s'], {
    input: scriptText,
    encoding: 'utf8',
    env: { ...process.env, ...env }
  });
}

describe('EC2 deployment privilege handling', function () {
  it('does not invoke sudo in deployment or downstream restarts', function () {
    assert.doesNotMatch(script, /\bsudo\b/);
    for (const step of restartSteps) {
      assert.doesNotMatch(step.run || '', /\bsudo\b/);
    }
  });

  it('rejects a non-root SSM session before changing files', function () {
    const result = run(`id() { echo 1000; }\n${preflight}`);
    assert.strictEqual(result.status, 1);
    assert.match(result.stderr, /must run as root/);
  });

  it('reports a missing runuser before changing files', function () {
    const result = run(`
      id() { echo 0; }
      command() { return 1; }
      ${preflight}
    `);
    assert.strictEqual(result.status, 1);
    assert.match(result.stderr, /runuser is required/);
  });

  it('accepts root with runuser available', function () {
    const result = run(`id() { echo 0; }\nrunuser() { :; }\n${preflight}`);
    assert.strictEqual(result.status, 0, result.stderr);
  });
});

describe('EC2 dependency installation and build', function () {
  let tempDir;

  beforeEach(function () {
    tempDir = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'gdcmvs-deploy-test-'));
    fs.mkdirSync(path.join(tempDir, 'target with spaces'));
  });

  afterEach(function () {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  function runBuild(setup, env = {}) {
    return run(`
      set -e
      TARGET_FOLDER="$TEST_HOME/target with spaces"
      runuser() {
        [ "$1" = "-u" ] && [ "$2" = "gdcmvs" ] && [ "$3" = "--" ] &&
          [ "$4" = "bash" ] && [ "$5" = "-lc" ] || return 90
        # Emulate the user switch without loading the test host's login profiles.
        HOME="$TEST_HOME" bash --noprofile --norc -c "$6" "\${@:7}"
      }
      ${setup}
      ${build}
    `, { TEST_HOME: tempDir, ...env });
  }

  const npmStub = `
    npm() { printf '%s:%s\\n' "$PWD" "$*" >> "$TEST_HOME/npm.log"; return "\${NPM_STATUS:-0}"; }
    export -f npm
  `;

  it('installs then builds as gdcmvs with a safely passed target path', function () {
    const result = runBuild(npmStub);
    assert.strictEqual(result.status, 0, result.stderr);
    const target = path.join(tempDir, 'target with spaces');
    assert.strictEqual(fs.readFileSync(path.join(tempDir, 'npm.log'), 'utf8'),
      `${target}:i\n${target}:run build\n`);
  });

  it('stops when dependency installation fails', function () {
    const result = runBuild(npmStub, { NPM_STATUS: '42' });
    assert.strictEqual(result.status, 42);
    assert.doesNotMatch(fs.readFileSync(path.join(tempDir, 'npm.log'), 'utf8'), /run build/);
  });

  it('propagates a failed client build', function () {
    const result = runBuild(`
      npm() { if [ "$1" = "run" ]; then return 43; fi; }
      export -f npm
    `);
    assert.strictEqual(result.status, 43);
  });

  it('loads NVM in the same gdcmvs shell that executes npm', function () {
    fs.mkdirSync(path.join(tempDir, '.nvm'));
    fs.writeFileSync(path.join(tempDir, '.nvm/nvm.sh'), `${npmStub}\nNPM_READY=1\n`);
    const result = runBuild(`
      command() {
        if [ "$1" = "-v" ] && [ "$2" = "npm" ] && [ "\${NPM_READY:-0}" != "1" ]; then
          return 1
        fi
        builtin command "$@"
      }
      export -f command
    `);
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(fs.readFileSync(path.join(tempDir, 'npm.log'), 'utf8'), /:run build/);
  });

  it('reports a missing Node.js runtime without running npm', function () {
    const result = runBuild(`
      command() {
        if [ "$1" = "-v" ] && [ "$2" = "node" ]; then return 1; fi
        builtin command "$@"
      }
      export -f command
      ${npmStub}
    `);
    assert.strictEqual(result.status, 1);
    assert.match(result.stderr, /Node.js and npm must be available for gdcmvs/);
    assert.strictEqual(fs.existsSync(path.join(tempDir, 'npm.log')), false);
  });
});

describe('Node.js restart SSM commands', function () {
  for (const step of restartSteps.filter(
    step => (step.run || '').includes('--parameters')
  )) {
    const parameters = step.run.match(/--parameters 'commands=(\[.*\])'/);
    const commands = JSON.parse(parameters[1]);

    it(`${step.name} runs directly as root`, function () {
      const result = run(`
        id() { echo 0; }
        systemctl() { printf '%s\\n' "$*"; }
        ${commands.join('\n')}
      `);
      assert.strictEqual(result.status, 0, result.stderr);
      assert.match(result.stdout, /^(restart nodejs|status nodejs -n 0)\n$/);
    });

    it(`${step.name} rejects non-root sessions`, function () {
      const result = run(`id() { echo 1000; }\n${commands.join('\n')}`);
      assert.strictEqual(result.status, 1);
      assert.match(result.stderr, /SSM must run as root/);
    });
  }
});
