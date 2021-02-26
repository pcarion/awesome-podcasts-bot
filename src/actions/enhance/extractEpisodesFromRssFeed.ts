import Parser from 'rss-parser';
import { PodcastEnhancedEpisode } from '../types';

export default async function extractEpisodesFromRssFeed(rssUrl: string): Promise<[PodcastEnhancedEpisode[], number]> {
  const parser = new Parser();
  let timestamp = 0; // keep track of most recent podcast
  console.log('>parsing feed>', rssUrl);
  const result: PodcastEnhancedEpisode[] = [];
  return new Promise((resolve) => {
    parser
      .parseURL(rssUrl)
      .then((feed) => {
        const debug = false;
        if (debug) {
          console.log(feed);
        }
        feed.items.forEach((item) => {
          if (item.pubDate) {
            const d = new Date(item.pubDate);
            const ts = d.valueOf();
            if (ts > timestamp) {
              timestamp = ts;
            }

            if (debug) {
              console.log(`pubDate;${item.pubDate}, d=${d}`);
            }
            result.push({
              publishingDate: `${d.getFullYear()}-${('' + (1 + d.getMonth())).padStart(2, '0')}-${(
                '' + d.getDate()
              ).padStart(2, '0')}`,
            });
          }
        });
        if (debug) {
          console.log(result);
        }
        return resolve([result, timestamp]);
      })
      .catch((err) => {
        console.log(`error retrieving episodes dor podcast: ${rssUrl}`);
        console.log(err);
        return resolve([result, timestamp]);
      });
  });
}
