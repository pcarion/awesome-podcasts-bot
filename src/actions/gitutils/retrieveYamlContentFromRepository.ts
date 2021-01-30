import axios from 'axios';
import yaml from 'js-yaml';
import { Octokit, RepoInformation } from '../types';

function loadYamlFile(content: string): unknown {
  const doc = yaml.load(content);
  if (!doc) {
    throw new Error(`error loading yaml content: ${content}`);
  }
  return doc;
}

export default async function retrieveYamlContentFromRepository(
  octo: Octokit,
  repoInformation: RepoInformation,
  path: string,
): Promise<unknown> {
  const content = await octo.repos.getContent({
    path: path,
    repo: repoInformation.repo,
    owner: repoInformation.owner,
  });
  console.log(`@@@ content for file:${path}`, content);
  if (!content) {
    throw new Error(`cannot retrieve file: ${path}`);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const file = content.data as any;
  // ts type expect an array of files -- but the response is a single file
  if (!file.download_url) {
    throw new Error(`no download URL for file: ${path}`);
  }
  if (file.type !== 'file') {
    throw new Error(`not a file at path: ${path}`);
  }

  const response = await axios({
    url: file.download_url,
    method: 'GET',
    responseType: 'text',
  });
  if (!response || !response.data) {
    throw new Error(`not retrieving content for: ${path}`);
  }
  return loadYamlFile(response.data);
}
