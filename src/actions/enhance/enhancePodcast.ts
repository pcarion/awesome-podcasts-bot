import Parser from 'rss-parser';

import { Podcast } from '../jtd/podcast';
import { PodcastEnhanced } from '../types';
import Vibrant from 'node-vibrant';

export default async function enhancePodcast(podcast: Podcast, fileName: string): Promise<PodcastEnhanced> {
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
  return new Promise((resolve, reject) => {
    if (podcast.imageUrl != '_') {
      try {
        console.log('>extracting color information from image>', podcast.imageUrl);
        Vibrant.from(podcast.imageUrl).getPalette((err, palette) => {
          if (err) {
            console.log('>ERROR>extracting color information from image>', err);
            return reject(err);
          }
          console.log(`>palette retrieved>image url>${podcast.imageUrl}>found>${!!palette}`);
          // console.log(palette);
          if (palette) {
            result.extra.colors.vibrant = palette.DarkMuted?.hex || null;
            result.extra.colors.darkVibrant = palette.DarkVibrant?.hex || null;
            result.extra.colors.lightVibrant = palette.LightVibrant?.hex || null;
            result.extra.colors.muted = palette.Muted?.hex || null;
            result.extra.colors.darkMuted = palette.DarkMuted?.hex || null;
            result.extra.colors.lightMuted = palette.LightMuted?.hex || null;
          }
          const parser = new Parser();
          console.log('>parsing feed>', podcast.feed.rss);
          parser
            .parseURL(podcast.feed.rss)
            .then((feed) => {
              const debug = false;
              if (debug) {
                console.log(feed);
              }
              feed.items.forEach((item) => {
                if (item.pubDate) {
                  const d = new Date(item.pubDate);
                  if (debug) {
                    console.log(`pubDate;${item.pubDate}, d=${d}`);
                  }
                  result.extra.episodes.push({
                    publishingDate: `${d.getFullYear()}-${('' + (1 + d.getMonth())).padStart(2, '0')}-${(
                      '' + d.getDate()
                    ).padStart(2, '0')}`,
                  });
                }
              });
              if (debug) {
                console.log(result.extra.episodes);
              }
              return resolve(result);
            })
            .catch((err) => {
              console.log(`podcast: ${podcast.feed.rss}`);
              console.log(err);
              return reject(err);
            });
        });
      } catch (err) {
        console.log(err);
        return resolve(result);
      }
    } else {
      console.log('>nothing to do>', result);
      return resolve(result);
    }
  });
}
