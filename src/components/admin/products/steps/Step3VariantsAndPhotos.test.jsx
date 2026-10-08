import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import Step3VariantsAndPhotos from './Step3VariantsAndPhotos';
import { uploadImages } from '@/lib/services/uploadService';

jest.mock('@/lib/services/uploadService', () => ({
  ...jest.requireActual('@/lib/services/uploadService'),
  uploadImages: jest.fn(),
}));

const OriginalImage = global.Image;
let previews;
beforeEach(() => {
  previews = [];
  global.Image = jest.fn(function () { previews.push(this); });
  uploadImages.mockReset();
});
afterEach(() => { global.Image = OriginalImage; });

function selectPhotos(count = 1) {
  const { container } = render(<Step3VariantsAndPhotos data={{}} updateData={jest.fn()} />);
  const input = container.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: Array.from({ length: count }, (_, i) => new File(['photo'], `${i}.jpg`, { type: 'image/jpeg' })) } });
  return input;
}

test('shows HAIZE immediately and waits for every thumbnail after uploading multiple photos', async () => {
  let finishUpload;
  uploadImages.mockReturnValue(new Promise((resolve) => { finishUpload = resolve; }));
  const input = selectPhotos(2);
  expect(screen.getByRole('status')).toHaveTextContent('HAIZE');
  expect(screen.getByRole('status')).toHaveTextContent('Cargando');
  expect(input).toBeDisabled();
  await act(async () => finishUpload([{ url: '/one.jpg' }, { url: '/two.jpg' }]));
  expect(previews).toHaveLength(2);
  await act(async () => previews[0].onload());
  expect(screen.getByRole('status')).toBeInTheDocument();
  await act(async () => previews[1].onload());
  expect(screen.queryByRole('status', { name: 'Carga de fotos' })).not.toBeInTheDocument();
  expect(screen.getByAltText('Foto 1')).toHaveAttribute('src', '/one.jpg');
  expect(screen.getByAltText('Foto 2')).toHaveAttribute('src', '/two.jpg');
  expect(input).toBeEnabled();
});

test('stops loading and permits retry after an upload failure', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  uploadImages.mockRejectedValue(new Error('Sin conexión'));
  const input = selectPhotos();
  await waitFor(() => expect(input).toBeEnabled());
  expect(screen.queryByRole('status', { name: 'Carga de fotos' })).not.toBeInTheDocument();
  expect(screen.getByText('Error subiendo fotos: Sin conexión')).toBeInTheDocument();
  log.mockRestore();
});

test('retains the saved photo and stops loading if its preview fails', async () => {
  uploadImages.mockResolvedValue([{ url: '/saved.jpg' }]);
  selectPhotos();
  await waitFor(() => expect(previews).toHaveLength(1));
  await act(async () => previews[0].onerror());
  expect(screen.queryByRole('status', { name: 'Carga de fotos' })).not.toBeInTheDocument();
  expect(screen.getByAltText('Foto 1')).toHaveAttribute('src', '/saved.jpg');
  expect(screen.getByText(/Las fotos se guardaron/)).toBeInTheDocument();
});
