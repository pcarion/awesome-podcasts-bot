import path from 'path';
import { HandleRegenerateAllJsonFilesArg, HandleRegenerateAllJsonFilesResponse } from './types';
import enhancePodcast from './enhance/enhancePodcast';
import loadExistingPodcastYamlFiles from './loadExistingPodcastYamlFiles';
import loadExistingPodcastJsonFiles from './loadExistingPodcastJsonFiles';
import addFilesToRepository from './gitutils/addFilesToRepository';
import resizePodcastImage from './resizePodcastImage';

export default async function handleRegenerateAllJsonFiles({
  octokit,
  repoInformation,
  podcastYamlDirectory,
  podcastJsonDirectory,
  podcastMetaDirectory,
}: HandleRegenerateAllJsonFilesArg): Promise<HandleRegenerateAllJsonFilesResponse> {
  try {
    // load existing podcasts
    const existingYamlPodcasts = await loadExistingPodcastYamlFiles(octokit, repoInformation, podcastYamlDirectory);
    const existingJsonPodcasts = await loadExistingPodcastJsonFiles(octokit, repoInformation, podcastJsonDirectory);
    const nbPodcasts = existingYamlPodcasts.length;
    // prepare for file additions
    const addToRepository = await addFilesToRepository(octokit, repoInformation);

    let nbEpisodes = 0;
    for (const podcast of existingYamlPodcasts) {
      console.log('>enhance podcast>', podcast.title);
      // search if we already have the json file for the podcast
      const alreadyEnhanced = existingJsonPodcasts.find(
        (p) => p.yamlDescriptionFile && p.yamlDescriptionFile === podcast.yamlDescriptionFile,
      );
      const podcastEnhanced = await enhancePodcast(
        podcast,
        path.basename(podcast.yamlDescriptionFile || 'unknown.yaml'),
        alreadyEnhanced,
      );
      if (!podcastEnhanced.extra.logoRepoImage) {
        const imageBuffer = await resizePodcastImage(podcastEnhanced.imageUrl, 128);
        console.log('@@@ resizePodcastImage>A1');
        if (imageBuffer) {
          console.log('@@@ resizePodcastImage>A2');
          const logoRepoImage = `${podcastEnhanced.pid}.png`;
          podcastEnhanced.extra.logoRepoImage = logoRepoImage;
          await addToRepository.addBuffer(`${podcastJsonDirectory}/${logoRepoImage}`, imageBuffer);
        }
        console.log('@@@ resizePodcastImage>A3');
      }
      nbEpisodes += podcastEnhanced.extra.episodes.length;

      console.log('>adding to repository>');
      await addToRepository.addJsonFile(`${podcastJsonDirectory}/${podcastEnhanced.pid}.json`, podcastEnhanced);
    }
    await addToRepository.addJsonFile(`${podcastMetaDirectory}/nbPodcasts.json`, { nbPodcasts });
    await addToRepository.addJsonFile(`${podcastMetaDirectory}/nbEpisodes.json`, { nbEpisodes });

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
