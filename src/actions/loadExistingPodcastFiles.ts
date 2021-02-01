import { Podcast } from './jtd/podcast';
import { Octokit, RepoInformation } from './types';
import extractRepositoryContent, { dowloadFiles } from './gitutils/extractRepositoryContent';
import validatePodcastYaml from './validatePodcastYaml';

export default async function loadExistingPodcastFiles(
  octokit: Octokit,
  repoInformation: RepoInformation,
  podcastsDirectory: string,
): Promise<Podcast[]> {
  const podcasts: Podcast[] = [];
  const files = await extractRepositoryContent(octokit, repoInformation, podcastsDirectory);

  // filter to get only yaml files and download their content
  const podcastFiles = files.filter((f) => f.name.endsWith('.yaml'));
  console.log('>podcast files to process:', podcastFiles);
  await dowloadFiles(podcastFiles);
  for (const file of podcastFiles) {
    console.log('>validate file:', file.path);
    if (!file.content) {
      throw new Error(`missing content for file: ${file.name}`);
    }
    const podcast = validatePodcastYaml(file.content, file.path);
    podcasts.push(podcast);
  }
  return podcasts;
}
