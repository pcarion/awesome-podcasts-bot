import path from 'path';
import { HandleRegenerateAllJsonFilesArg, HandleRegenerateAllJsonFilesResponse } from './types';
import enhancePodcast from './enhance/enhancePodcast';
import loadExistingPodcastFiles from './loadExistingPodcastFiles';
import addFilesToRepository from './gitutils/addFilesToRepository';

export default async function handleRegenerateAllJsonFiles({
  octokit,
  repoInformation,
  podcastYamlDirectory,
  podcastJsonDirectory,
}: HandleRegenerateAllJsonFilesArg): Promise<HandleRegenerateAllJsonFilesResponse> {
  try {
    // load existing podcasts
    const existingPodcasts = await loadExistingPodcastFiles(octokit, repoInformation, podcastYamlDirectory);
    const addToRepository = await addFilesToRepository(octokit, repoInformation);

    for (const podcast of existingPodcasts) {
      console.log('>enhance podcast>', podcast);
      const podcastEnhanced = await enhancePodcast(
        podcast,
        path.basename(podcast.yamlDescriptionFile || 'unknown.yaml'),
      );
      console.log('>enhanced as>', podcastEnhanced);

      console.log('>adding to repository>');
      await addToRepository.addJsonFile(`${podcastJsonDirectory}/${podcastEnhanced.pid}.json`, podcastEnhanced);
    }
    const sha = await addToRepository.commit(`upating all podcasts`, repoInformation.defaultBranch);
    console.log('>files commites, sha is:>', sha);
    return {
      isSuccess: true,
      errorMessage: undefined,
    };
  } catch (err) {
    console.log(err);
    return {
      isSuccess: false,
      errorMessage: err.message || err.toString(),
    };
  }
}
