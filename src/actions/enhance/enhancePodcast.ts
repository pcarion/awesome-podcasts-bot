import { Podcast } from '../jtd/podcast';
import { PodcastEnhanced } from '../types';
import extractColorsFromUrl from './extractColorsFromUrl';
import extractEpisodesFromRssFeed from './extractEpisodesFromRssFeed';

export default async function enhancePodcast(
  podcast: Podcast,
  fileName: string,
  alreadyEnhanced?: PodcastEnhanced,
): Promise<PodcastEnhanced> {
  const result: PodcastEnhanced = {
    ...podcast,
    yamlDescriptionFile: fileName,
    extra: {
      colors: {
        vibrant: null,
        darkVibrant: null,
        lightVibrant: null,
        muted: null,
        darkMuted: null,
        lightMuted: null,
      },
      episodes: [],
    },
  };
  let needColorExtraction = true;
  if (alreadyEnhanced) {
    if (alreadyEnhanced.extra.logoRepoImage) {
      result.extra.logoRepoImage = alreadyEnhanced.extra.logoRepoImage;
    }
    if (podcast.imageUrl !== '_' && alreadyEnhanced.extra.colors && alreadyEnhanced.extra.colors.vibrant) {
      needColorExtraction = false;
      result.extra.colors = alreadyEnhanced.extra.colors;
    }
  }
  try {
    if (needColorExtraction) {
      const colors = await extractColorsFromUrl(podcast.imageUrl);
      result.extra.colors = colors;
    }
    const episodes = await extractEpisodesFromRssFeed(podcast.feed.rss);
    result.extra.episodes = episodes;
    return result;
  } catch (err) {
    console.log(err);
    return result;
  }
}
