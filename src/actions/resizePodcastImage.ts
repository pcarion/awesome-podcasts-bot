import Jimp from 'jimp';

export default async function resizePodcastImage(imageUrl: string, size: number): Promise<Buffer | null> {
  console.log(`> resizing image: ${imageUrl}`);
  try {
    return Jimp.read(imageUrl)
      .then((image) => {
        return image.cover(size, size);
      })
      .then((image) => {
        return image.quality(90);
      })
      .then((image) => {
        return image.getBufferAsync(Jimp.MIME_PNG);
      })
      .catch((err) => {
        console.error(`> Error resizing image: ${imageUrl}:`, err);
        return null;
      });
  } catch (err) {
    console.error('resizePodcastImage>', imageUrl, err);
    return null;
  }
}
