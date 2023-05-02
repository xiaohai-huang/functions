import sharp from "sharp";
import NodeCache from "node-cache";

// cache for 7 days
const imageCache = new NodeCache({ stdTTL: 604800, useClones: false });

export default async function handler(req, res) {
  const { url, width, height, format = "origin", quality = 0.8 } = req.query;
  let buffer = imageCache.get(url);
  let cacheControl;
  if (!buffer) {
    const response = await fetch(url);
    buffer = await response.arrayBuffer();
    cacheControl = response.headers.get("cache-control");
    imageCache.set(url, buffer);
  }

  const image = sharp(buffer);
  const metadata = await image.metadata();
  const outputFormat = format === "origin" ? metadata.format : format;
  const resizedImage = await image
    .resize(width ? parseInt(width) : null, height ? parseInt(height) : null)
    .toFormat(outputFormat)
    .jpeg({ quality: parseFloat(quality) * 100 })
    .png({ quality: parseFloat(quality) * 100 })
    .webp({ quality: parseFloat(quality) * 100 })
    .toBuffer();
  if (cacheControl) {
    res.set("Cache-Control", cacheControl);
  }
  res.type(`image/${outputFormat}`).send(resizedImage);
}
