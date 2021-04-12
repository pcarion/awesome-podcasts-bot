import Vibrant from 'node-vibrant';

import { PodcastEnhancedColors } from '../types';

export default async function extractColorsFromUrl(imageUrl: string): Promise<PodcastEnhancedColors> {
  return new Promise((resolve, reject) => {
    const result: PodcastEnhancedColors = {
      vibrant: null,
      darkVibrant: null,
      lightVibrant: null,
      muted: null,
      darkMuted: null,
      lightMuted: null,
    };
    try {
      console.log('>extracting color information from image>', imageUrl);
      Vibrant.from(imageUrl).getPalette((err, palette) => {
        if (err) {
          console.error('>ERROR>extracting color information from image>', err);
          return reject(err);
        }
        console.log(`>palette retrieved>image url>${imageUrl}>found>${!!palette}`);
        // console.log(palette);
        if (palette) {
          result.vibrant = palette.DarkMuted?.hex || null;
          result.darkVibrant = palette.DarkVibrant?.hex || null;
          result.lightVibrant = palette.LightVibrant?.hex || null;
          result.muted = palette.Muted?.hex || null;
          result.darkMuted = palette.DarkMuted?.hex || null;
          result.lightMuted = palette.LightMuted?.hex || null;
        }
        return resolve(result);
      });
    } catch (err) {
      console.log(err);
      return resolve(result);
    }
  });
}
