import { PodcastEnhanced } from './types';
import { Octokit, RepoInformation } from './types';
import extractRepositoryContent, { dowloadFiles } from './gitutils/extractRepositoryContent';

export default async function loadExistingPodcastJsonFiles(
  octokit: Octokit,
  repoInformation: RepoInformation,
  podcastsDirectory: string,
): Promise<PodcastEnhanced[]> {
  const podcasts: PodcastEnhanced[] = [];
  const files = await extractRepositoryContent(octokit, repoInformation, podcastsDirectory);

  // filter to get only yaml files and download their content
  const podcastFiles = files.filter((f) => f.name.endsWith('.json'));
  console.log('>podcast files to process:', podcastFiles);
  await dowloadFiles(podcastFiles);
  for (const file of podcastFiles) {
    console.log('>validate file:', file.path);
    if (!file.content) {
      throw new Error(`missing content for file: ${file.name}`);
    }
    try {
      // TODO: validate content?
      const podcast: PodcastEnhanced = JSON.parse(file.content);
      // check if the have the jpeg file for the podcast
      const jpegName = `${podcast.pid}.jpeg`;
      if (files.find((f) => f.name === jpegName)) {
        podcast.extra.logoRepoImage = jpegName;
      } else {
        podcast.extra.logoRepoImage = undefined;
      }
      podcasts.push(podcast);
    } catch (err) {
      console.log('>error reading content of file>path>', file.path);
      console.log(err);
    }
  }
  return podcasts;
}
