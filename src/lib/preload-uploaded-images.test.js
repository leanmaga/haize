import { preloadUploadedImages } from './preload-uploaded-images';

test('settles stalled previews after the timeout', async () => {
  jest.useFakeTimers();
  const original = global.Image;
  const images = [];
  global.Image = jest.fn(function () { images.push(this); });
  try {
    const result = preloadUploadedImages([{ url: '/slow.jpg' }]);
    jest.advanceTimersByTime(30000);
    await expect(result).resolves.toBe(false);
    expect(images[0].onload).toBeNull();
    expect(images[0].onerror).toBeNull();
  } finally {
    global.Image = original;
    jest.useRealTimers();
  }
});
