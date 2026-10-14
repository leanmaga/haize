jest.mock('cloudinary', () => ({ v2: { config: jest.fn(), uploader: { upload: jest.fn() } } }));
jest.mock('./mercadolibre', () => ({ mercadoLibreRequest: jest.fn() }));
import { largestPicture, resolveMercadoLibrePictures, replaceMercadoLibrePictures, storeMercadoLibrePictures } from './mercadolibre-images';
import { mercadoLibreRequest } from './mercadolibre';
import { v2 as cloudinary } from 'cloudinary';

const picture = { id: '123-MLA456', size: '500x500', max_size: '1920x1920', secure_url: 'https://http2.mlstatic.com/D_123-MLA456-O.jpg' };
test('selects the largest non-cropped rendition rather than treating max_size as current size', () => {
  expect(largestPicture(picture, { variations: [
    { size: '2000x2000', secure_url: 'https://http2.mlstatic.com/D_123-MLA456-C.jpg' },
    { size: '1200x1540', secure_url: 'https://http2.mlstatic.com/D_123-MLA456-F.jpg' },
    { size: '5000x5000', secure_url: 'https://other.example/large.jpg' },
  ] })).toBe('https://http2.mlstatic.com/D_123-MLA456-F.jpg');
});
test('keeps the available picture and reports unavailable resolution metadata', async () => {
  mercadoLibreRequest.mockRejectedValueOnce(new Error('Unavailable'));
  const result = await resolveMercadoLibrePictures({ pictures: [picture] });
  expect(result.item.pictures[0].secure_url).toBe(picture.secure_url);
  expect(result.warning).not.toBe('');
});
test('replaces only ML photos while preserving custom photos, ordering and variant data', () => {
  const copies = [{ id: picture.id, source: picture.secure_url, url: 'https://res.cloudinary.com/new.jpg' }];
  const result = replaceMercadoLibrePictures({ imageUrl: picture.secure_url,
    additionalImages: [{ url: 'https://res.cloudinary.com/custom.jpg' }],
    variants: [{ stock: 3, color: 'Azul', images: [picture.secure_url] }],
  }, copies);
  expect(result.imageUrl).toBe(copies[0].url);
  expect(result.additionalImages[0].url).toBe('https://res.cloudinary.com/custom.jpg');
  expect(result.variants[0]).toMatchObject({ stock: 3, color: 'Azul', images: [copies[0].url] });
});
test('stores originals without crop, resize or lossy upload transformations', async () => {
  const previous = { ...process.env };
  Object.assign(process.env, { CLOUDINARY_CLOUD_NAME: 'test', CLOUDINARY_API_KEY: 'test', CLOUDINARY_API_SECRET: 'test' });
  cloudinary.uploader.upload.mockResolvedValue({ secure_url: 'https://res.cloudinary.com/original.jpg' });
  try {
    const result = await storeMercadoLibrePictures({ id: 'MLA123', pictures: [picture] });
    expect(result[0].url).toBe('https://res.cloudinary.com/original.jpg');
    const [url, options] = cloudinary.uploader.upload.mock.calls[0];
    expect(url).toBe(picture.secure_url);
    expect(options.overwrite).toBe(false);
    expect(options.transformation).toBeUndefined();
  } finally { process.env = previous; }
});
