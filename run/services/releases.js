const util = require('util');
const exec = util.promisify(require('child_process').exec);

const config = require('../../config');
const ScalingoClient = require('../../common/services/scalingo-client');

const DEPLOY_PIX_UI_SCRIPT = 'deploy-pix-ui.sh';


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