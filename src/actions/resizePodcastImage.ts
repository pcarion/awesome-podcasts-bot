//import Jimp from 'jimp';
import axios from 'axios';

export default async function resizePodcastImage(imageUrl: string, size: number): Promise<Buffer | null> {
  return new Promise<Buffer | null>((resolve) => {
    console.log(`> resizing image: ${imageUrl} to be of size: ${size}`);
    try {
      console.log(`> resizing image: ${imageUrl}>A0>axios>GET (promise/skipping)`);
      axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'arraybuffer',
      }).then((response) => {
        console.log('@@@ skipping>', !!response);
        //  return resolve(null);
        //   console.log(`> resizing image: ${imageUrl}>A1>imageBuffer>`, response.statusText);
        //   const imageBuffer: ArrayBuffer = response.data;
        //   return Jimp.read(Buffer.from(imageBuffer));
        // })
        // .then((image) => {
        //   console.log(`> resizing image: ${imageUrl}>B`);
        //   return image.cover(size, size);
        // })
        // .then((image) => {
        //   console.log(`> resizing image: ${imageUrl}>C`);
        //   return image.quality(90);
        // })
        // .then((image) => {
        //   console.log(`> resizing image: ${imageUrl}>D`);
        //   return image.getBufferAsync(Jimp.MIME_PNG);
        // })
        // .then((buffer) => {
        //   console.log(`> resizing image: ${imageUrl}>buffer>`);
        //   return resolve(buffer);
        // })
        // .catch((err) => {
        //   console.log(`> resizing image: ${imageUrl}>X`);
        //   console.error(`> Error resizing image: ${imageUrl}:`, err);
        return resolve(null);
      });
    } catch (err) {
      console.error('resizePodcastImage>', imageUrl, err);
      return resolve(null);
    }
  });
}
