import got from 'got';
import sharp from 'sharp';

export default async function resizePodcastImage(imageUrl: string, size: number): Promise<Buffer> {
  console.log(`@@@ resizing image: ${imageUrl} ...`);
  const sharpStream = sharp({
    failOnError: false,
  });

  const promise = sharpStream.clone().resize({ width: size }).jpeg({ quality: 100 }).toBuffer({
    resolveWithObject: true,
  });
  got.stream(imageUrl).pipe(sharpStream);

  return promise
    .then((obj) => {
      console.log('>data>', obj.info);
      return obj.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
}
