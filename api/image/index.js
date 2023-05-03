import sharp from "sharp";
import NodeCache from "node-cache";

// cache for 7 days
const imageCache = new NodeCache({ stdTTL: 604800, useClones: false });

export default async function handler(req, res) {
  const {
    url: rawUrl,
    width,
    height,
    format = "origin",
    quality = 1,
  } = req.query;
  const url = decodeURIComponent(rawUrl);

  let response = imageCache.get(url);
  if (!response) {
    response = await fetch(url);
    const cacheControl = response.headers.get("Cache-Control");
    const buffer = await response.arrayBuffer();
    imageCache.set(url, { cacheControl, buffer });
  }
  const { buffer, cacheControl } = imageCache.get(url);

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
