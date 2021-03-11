const util = require('util');
const exec = util.promisify(require('child_process').exec);

const config = require('../../config');
const ScalingoClient = require('./scalingo-client');

const DEPLOY_PIX_UI_SCRIPT = 'deploy-pix-ui.sh';
const RELEASE_PIX_SCRIPT = 'release-pix-repo.sh';

module.exports = {

  environments: {
    recette: 'recette',
    production: 'production'
  },

  async deployPixRepo(repoName, appName, releaseTag) {
    const sanitizedReleaseTag = _sanitizedArgument(releaseTag);
    const sanitizedRepoName = _sanitizedArgument(repoName);
    const sanitizedAppName = _sanitizedArgument(appName);

    const client = await ScalingoClient.getInstance('production');
    return client.deployFromArchive(sanitizedAppName, sanitizedReleaseTag, sanitizedRepoName);
  },

  async deploy(environment, releaseTag) {
    const sanitizedEnvironment = _sanitizedArgument(environment);
    const sanitizedReleaseTag = _sanitizedArgument(releaseTag);

    const client = await ScalingoClient.getInstance(sanitizedEnvironment);

    const results = await Promise.all(config.pixApps.map(pixApp => {
      return client.deployFromArchive(pixApp, sanitizedReleaseTag);
    }));

    return results;
  },

  async deployPixUI() {
    const args = [config.github.owner, 'pix-ui'];
    await _runScriptWithArgument(DEPLOY_PIX_UI_SCRIPT, ...args);
  },

  async publish(releaseType) {
    const scriptFileName = 'publish.sh';
    try {
      const sanitizedReleaseType = _sanitizedArgument(releaseType);
      await _runScriptWithArgument(scriptFileName, sanitizedReleaseType);
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  async publishPixRepo(repoName, releaseType) {
    try {
      const sanitizedReleaseType = _sanitizedArgument(releaseType);
      const sanitizedRepoName = _sanitizedArgument(repoName);
      const args = [config.github.owner, sanitizedRepoName, sanitizedReleaseType];
      await _runScriptWithArgument(RELEASE_PIX_SCRIPT, ...args);
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

};

async function _runScriptWithArgument (scriptFileName, ...args) {
  const scriptsDirectory = `${process.cwd()}/scripts`;
  const {stdout, stderr} = await exec(`${scriptsDirectory}/${scriptFileName} ${args.join(' ')}`);
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
}

function _sanitizedArgument(param) {
  return param? param.trim().toLowerCase(): null;
}