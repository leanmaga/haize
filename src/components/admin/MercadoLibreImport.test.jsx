import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MercadoLibreImport from './MercadoLibreImport';
jest.mock('@/hooks/useCategories', () => ({ __esModule: true, default: () => ({ categories: [{ name: 'Remeras', slug: 'remeras' }] }) }));

const preview = {
  title: 'Remera importada', description: 'Descripción de la remera importada', salePrice: 100,
  imageUrl: 'https://http2.mlstatic.com/photo.jpg', additionalImages: [], stock: 4,
  variants: [{ sku: 'ML-1', color: 'Negro', size: 'M', stock: 4 }],
};
beforeEach(() => {
  global.fetch = jest.fn(async (url, options) => ({ ok: true, json: async () => {
    if (options?.method === 'POST') return { imported: { productId: 'created', title: 'Título para mi tienda' } };
    if (url.includes('itemId=')) return { preview, status: 'active' };
    return { items: [{ id: 'MLA123', title: preview.title, price: 100, currency: 'ARS', status: 'active' }], nextCursor: null };
  } }));
});

test('reviews and edits a selected publication before creating and linking it', async () => {
  const onImported = jest.fn();
  render(<MercadoLibreImport connected onImported={onImported} />);
  fireEvent.click(screen.getByRole('button', { name: 'Traer mis publicaciones' }));
  fireEvent.click(await screen.findByRole('checkbox', { name: 'Seleccionar Remera importada' }));
  fireEvent.click(screen.getByRole('button', { name: 'Revisar seleccionados (1)' }));
  const title = await screen.findByLabelText('Título');
  expect(title).toHaveValue(preview.title);
  fireEvent.change(title, { target: { value: 'Título para mi tienda' } });
  fireEvent.change(screen.getByLabelText('Categoría en Haize'), { target: { value: 'remeras' } });
  expect(global.fetch.mock.calls.some(([, options]) => options?.method === 'POST')).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Importar a Haize' }));
  expect(await screen.findByRole('link', { name: 'Editar Título para mi tienda en Haize' })).toHaveAttribute('href', '/admin/products/edit/created');
  const [, options] = global.fetch.mock.calls.find(([, options]) => options?.method === 'POST');
  expect(JSON.parse(options.body)).toMatchObject({ itemId: 'MLA123', title: 'Título para mi tienda', category: 'remeras' });
  expect(JSON.parse(options.body).stock).toBeUndefined();
  expect(screen.getByRole('link', { name: 'Ya vinculada' })).toBeInTheDocument();
  expect(onImported).toHaveBeenCalledTimes(1);
});

test('disables import before connecting and shows API errors', async () => {
  const { rerender } = render(<MercadoLibreImport connected={false} />);
  expect(screen.getByRole('button', { name: 'Traer mis publicaciones' })).toBeDisabled();
  rerender(<MercadoLibreImport connected />);
  global.fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Cuenta sin permisos' }) });
  fireEvent.click(screen.getByRole('button', { name: 'Traer mis publicaciones' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Cuenta sin permisos');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Traer mis publicaciones' })).toBeEnabled());
});

test('refreshes photos of a linked product without importing it again', async () => {
  const imported = { productId: 'existing', title: preview.title };
  global.fetch.mockImplementation(async (_url, options) => ({ ok: true, json: async () => options?.method === 'PATCH'
    ? { imported }
    : { items: [{ id: 'MLA123', title: preview.title, price: 100, status: 'active', imported }] },
  }));
  render(<MercadoLibreImport connected />);
  fireEvent.click(screen.getByRole('button', { name: 'Traer mis publicaciones' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Mejorar fotos' }));
  expect(await screen.findByText('Fotos actualizadas con la mejor resolución disponible.')).toBeInTheDocument();
  const [, options] = global.fetch.mock.calls.find(([, options]) => options?.method === 'PATCH');
  expect(JSON.parse(options.body)).toEqual({ itemId: 'MLA123' });
  expect(global.fetch.mock.calls.some(([, options]) => options?.method === 'POST')).toBe(false);
});
