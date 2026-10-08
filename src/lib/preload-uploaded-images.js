// Wait for the thumbnails too, not just the upload response. A failed preview
// must not discard an image that was already saved on the server.
export async function preloadUploadedImages(images, timeoutMs = 30000) {
  const results = await Promise.all(images.map(({ url }) => new Promise((resolve) => {
    const image = new Image();
    const finish = (loaded) => {
      clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      resolve(loaded);
    };
    const timer = setTimeout(() => finish(false), timeoutMs);
    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    image.src = url;
  })));
  return results.every(Boolean);
}
