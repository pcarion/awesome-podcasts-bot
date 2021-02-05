import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';
import getConfigurationData from './actions/gitutils/getConfigurationData';
import getRepositoryInformation from './actions/gitutils/getRepositoryInformation';
import handleRegenerateAllJsonFiles from './actions/handleRegenerateAllJsonFiles';

interface RepositoryOwner {
  owner: string;
  repo: string;
}

function getRepositoryOwner(): RepositoryOwner {
  const githubRepository = process.env['GITHUB_REPOSITORY'];
  if (!githubRepository) {
    throw new Error(`env not set:GITHUB_REPOSITORY`);
  }
  const parts = githubRepository.split('/');
  if (!parts || parts.length !== 2) {
    throw new Error(`invalid env :GITHUB_REPOSITORY=${githubRepository}`);
  }
  return {
    owner: parts[0].trim(),
    repo: parts[1].trim(),
  };
}

async function run() {
  try {
    console.log('> Starting github action...');
    const token = core.getInput('repo-token', { required: true });
    const octokit = getOctokit(token);

    const repo = getRepositoryOwner();

    const info = await getRepositoryInformation(octokit, repo.owner, repo.repo);

    const { podcastYamlDirectory, podcastJsonDirectory } = await getConfigurationData(octokit, info);

    const payload = JSON.stringify(context, undefined, 2);
    console.log(`> The github action context is: ${JSON.stringify(payload, null, 2)}`);
    console.log('====');
    await handleRegenerateAllJsonFiles({
      octokit,
      repoInformation: info,
      podcastYamlDirectory,
      podcastJsonDirectory,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
